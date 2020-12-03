import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Environment,
  VrButton,
  VrHeadModel,
  asset,
  NativeModules
  /*Native modules in React 360 provide us with the ability to access functionality that is only available in the main browser environment. In the game, we will use
AudioModule in NativeModules, to play sounds in response to user activity, and the Location module, to give us access to window.location in the browser to handle
external links */
} from 'react-360'
import Entity from 'Entity'
const {AudioModule, Location} = NativeModules

export default class MERNVR extends React.Component {
  constructor() {
    super()
    this.state = {
      /*we will start developing the game features here with dummy game data that is set in component state. */
      game: {
        /*name: A string representing the name of the game */
        name: 'Space Exploration',
        /*world: A string with the URL pointing to the equirectangular image either hosted on cloud storage, CDNs, or stored on MongoDB */
        world: 'https://s3.amazonaws.com/mernbook/vrGame/milkyway.jpg',
        /*answerObjects: An array of JavaScript objects containing details of the VR objects that can be collected by the player */
        answerObjects: [
          //e object will contain links to the 3D data resource files and transform style property values.
          {
            /*OBJ and MTL links: The 3D data information resources for the VR objects will be added to the objUrl and mtlUrl attributes */
            objUrl: 'https://s3.amazonaws.com/mernbook/vrGame/planet.obj', //objUrl: The link to the .obj file for the 3D object
            mtlUrl: 'https://s3.amazonaws.com/mernbook/vrGame/planet.mtl', // mtlUrl: The link to the accompanying .mtl file
            /*The objUrl and mtlUrl links may point to files either hosted on cloud storage, CDNs, or stored on MongoDB */
            /*we will assume that makers will add URLs to their own hosted OBJ, MTL, and equirectangular image files. */
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /*Translation values: The position of the VR object in the 3D space will be defined with the translate values */
            /*translateX: The translation value of the object along the x axis */
            translateX: -50,
            /*translateY: The translation value of the object along the y axis */
            translateY: 0,
            /*translateZ: The translation value of the object along the z axis */
            // All translation values are numbers in meters.
            translateZ: 30,
            /*Rotation values: The orientation of the 3D object will be defined with the rotate values */
            /*rotateX: The rotation value of the object around the x axis; in other words, turning the object up or down */
            rotateX: 0,
            /*rotateY: The rotation value of the object around the y axis that would turn the object left or right */
            rotateY: 0,
            /*rotateZ: The rotation value of the object around the z axis, making the object tilt forward or backward */
            /*NB:All rotation values are in numbers or string representations of a number in degrees. */
            rotateZ: 0,
            /*Scale value: The scale value will define the relative size and appearance of the 3D object in the 3D environment */
            scale: 7, //scale: A number value that defines uniform scale across all axes
            /*Color: If the 3D object's material texture is not provided in an MTL file, a color value can be defined to set the default color of the object in the color attribute */
            color: 'white' //color: A string value representing color values allowed in  CSS
          }
        ],
        /*wrongObjects: An array of JavaScript objects containing details of the other VR objects to be placed in the VR world that cannot be collected by
the player */
        wrongObjects: [
          //e object will contain links to the 3D data resource files and transform style property values.
          {
            objUrl: 'https://s3.amazonaws.com/mernbook/vrGame/tardis.obj',
            mtlUrl: 'https://s3.amazonaws.com/mernbook/vrGame/tardis.mtl',
            translateX: 0,
            translateY: 0,
            translateZ: 90,
            rotateX: 0,
            rotateY: 20,
            rotateZ: 0,
            scale: 1,
            color: 'white'
          }
        ]
      },
      /*The arrays containing the VR object details will store properties of each object to be added to the 3D world in the game. */
      vrObjects: [],
      hide: 'none',
      collectedNum: 0,
      collectedList: [],
      hmMatrix: VrHeadModel.getHeadMatrix()
    }
    /*Using the rotate method, we will update the rotateY transform value of the given
object at a steady rate on a set time interval with requestionAnimationFrame */
    this.lastUpdate = Date.now()
  }
  componentDidMount = () => {
    /*we will concatenate the answerObjects and wrongObjects arrays in componentDidMount to form a single array containing all of the VR objects.
    This will give us a single array containing all of the VR objects for the game */
    let vrObjects = this.state.game.answerObjects.concat(this.state.game.wrongObjects)
    this.setState({vrObjects: vrObjects})
    Environment.setBackgroundImage(
      /*In order to set the game's 360-degree world background, we will update the current
background scene using the setBackgroundImage method from the Environment
API. We will call this inside the componentDidMount of the MERNVR component */
      {uri: this.state.game.world}
    )
  }
  /*setModelStyles method */
  setModelStyles = (vrObject, index) => {
    return {
      /*The display property will allow us to show or hide an object based on whether it
has already been collected by the player or not */
/*Using the collectedList array, we will also determine which Entity component should be hidden from the view because the associated object was collected. The
display style property of the relevant Entity component will be set based on the Boolean value of the corresponding index in the collectedList array */
            display: this.state.collectedList[index] ? 'none' : 'flex',
            color: vrObject.color,
            transform: [
              /*The translate and rotate values
will render the 3D objects in the desired positions and orientations across the VR
world. */
              {translateX: vrObject.translateX},
              {translateY: vrObject.translateY},
              {translateZ: vrObject.translateZ},
              {scale: vrObject.scale},
              {rotateY: vrObject.rotateY},
              {rotateX: vrObject.rotateX},
              {rotateZ: vrObject.rotateZ}
            ]
          }
  }
  /*When a 3D object is clicked on by a user, we need the collectItem method to perform the following actions with respect to the game features */
  collectItem = vrObject => event => {
    /*Any time a VR object is clicked on by the user, in this method, we will first check the type of the object before taking the related actions */
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*To check whether the clicked VR object is an answerObject, we will use the indexOf method to find a match in the answerObjects array */
    let match = this.state.game.answerObjects.indexOf(vrObject)
    /*If the vrObject is an answerObject, indexOf will return the array index of the matched object; otherwise, it will return -1 if no match is found. */
    if (match != -1) {
      /*To keep track of collected objects in the game, we will also maintain an array of Boolean values in collectedList at corresponding indices, and the total number of
objects collected so far in collectedNum */
      let updateCollectedList = this.state.collectedList
      let updateCollectedNum = this.state.collectedNum + 1
      updateCollectedList[match] = true
      this.checkGameCompleteStatus(updateCollectedNum)
      /*When the treasure chest is clicked on, it disappears from the view as the
collectedList is updated, and we also play the sound effect for collection using
AudioModule.playOneShot */
      AudioModule.playOneShot({
          source: asset('collect.mp3'),
      })
      this.setState({collectedList: updateCollectedList, collectedNum: updateCollectedNum})
    } else {
      /*Sound effects: To play a single sound once when the user clicks on 3D objects, we will use the playOneShot method that takes an audio file path
as the source attribute */
      AudioModule.playOneShot({
        /*The source attribute in the options passed to playEnvironmental and
playOneShot takes a resource file location to load the audio */
////////////////////////////////////////////////////////////////////////////////////////////////////
/*However, when the flower pot is clicked on, and it is identified as a wrong object, we play another sound effect indicating it cannot be collected */
        source: asset('clog-up.mp3'), //we will place the sound audio files for the game in the static_assets folder, to be retrieved using asset() for each audio added to the game,
        /*It can be an asset() statement or a resource URL declaration in the form of {uri: 'PATH'}. */
      })
    }
  }
  /*Every time an answerObject is collected, we will check whether the total number of collected items is equal to the total number of objects in the answerObjects array to
determine whether the game is complete. */
  checkGameCompleteStatus = (collectedTotal) => {
    if (collectedTotal == this.state.game.answerObjects.length) {
      /*Environmental audio: To play audio on loop and set the mood when the game is successfully completed, we will use the playEnvironmental
method, which takes an audio file path as the source attribute, and the loop option as a playback parameter */
      AudioModule.playEnvironmental({
        //Play the audio for game completed, using AudioModule.playEnvironmental
        source: asset('happy-bot.mp3'),
        loop: true
      })
      /*Fetch the current headMatrix value using VrHeadModel so that it can be set as the transform matrix value for the View component containing the
game completion message */
/*Set the display style property of the View message to flex, so the message renders to the viewer */
      this.setState({hide: 'flex', hmMatrix: VrHeadModel.getHeadMatrix()})
    }
  }
  /*The call to the setGameCompletedStyle() method will set the styles for the View
message with the updated display value and the transform matrix
value */
  setGameCompletedStyle = () => {
    return {
            position: 'absolute',
            display: this.state.hide,
            layoutOrigin: [0.5, 0.5],
            width: 6,
            transform: [{translate: [0, 0, 0]}, {matrix: this.state.hmMatrix}]
          }
  }
  /*The final text in the View message will act as a button, as we wrapped this View in a
VrButton component that calls the exitGame method when clicked */
  exitGame = () => {
    /*Handling outgoing links: When we want to direct the user out of the VR application to another link, we can use the replace method in Location,
as shown in the following code:
Location.replace(url) */
/*The exitGame method will use the Location.replace method to redirect the user to an external URL that may contain a list of games */
    Location.replace('/')
  }
  rotate = index => event => {
    const now = Date.now()
    const diff = now - this.lastUpdate
    const vrObjects = this.state.vrObjects
    vrObjects[index].rotateY = vrObjects[index].rotateY + diff / 200
    /*Using the rotate method, we will update the rotateY transform value of the given
object at a steady rate on a set time interval with requestionAnimationFrame */
    this.lastUpdate = now
    this.setState({vrObjects: vrObjects})
    /*The requestAnimationFrame method will take the rotate method as a recursive callback function, then execute it to redraw each frame of the rotation animation with
the new values, and, in turn, update the animation on the screen. */
    this.requestID = requestAnimationFrame(this.rotate(index))
  }
  /*The requestAnimateFrame method returns a requestID, which we will use in the call to stopRotate, so the animation gets canceled in the stopRotate method */
  stopRotate = () => {
    if (this.requestID) {
      /*This will implement the functionality of animating the 3D object only when it is in the
viewer's focus. */
      cancelAnimationFrame(this.requestID)
      this.requestID = null
    }
  }
  render() {
    return (
      <View>
        {/* we will iterate over this merged vrObjects array to render
the Entity components with details of each object */}
        {this.state.vrObjects.map((vrObject, i) => {
          /*onClick: The onClick event is used with the VrButton component, and is fired when there is click interaction with VrButton. We will use this to
set click event handlers on the VR objects, and also on the game complete message to redirect the user out of the VR application to a link containing a
list of games */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*In order to register the click behavior on each 3D object added to the game, we need to wrap the Entity component with a VrButton component that can call the
onClick handler */
/*The VrButton component will call the collectItem method when clicked on, and pass it the current object's details */
            return (<VrButton onClick={this.collectItem(vrObject)} key={i}>
              {/* The setModelStyles method constructs the styles for the
specific VR object to be rendered, using values defined in the VR object's details. */}
                      <Entity style={this.setModelStyles(vrObject, i)}
                      /*The obj and mtl file links are added to the source prop in Entity, and the
transform style details are applied in the Entity component's styles with the call
to setModelStyles */
                        source={{
                          obj: {uri: vrObject.objUrl},
                          mtl: {uri: vrObject.mtlUrl}
                        }}
              /*We want to add a feature that starts rotating a 3D object around its y axis whenever a player focuses on the 3D object, that is, when the platform cursor begins intersecting
with the Entity component rendering the specific 3D object. */
                        // /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                        /*onEnter: This event is fired whenever the platform cursor begins intersecting with a component. We will capture this event for the VR
objects in the game, so the objects can start rotating around the y axis when the platform cursor enters the specific object */
                        onEnter={this.rotate(i)}
                        /*onExit: This event is fired whenever the platform cursor stops intersecting
with a component */
                        onExit={this.stopRotate}
                      />
                    </VrButton>
                  )
        })}
        {/* The View component containing the message congratulating the player for
completing the game will be added to the parent View componen */}
        <View style={this.setGameCompletedStyle()}>
          {/* These style objects defined using StyleSheet.create can be added to components
as required */}
          <View style={styles.completeMessage}>
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.collectedText}>You have collected all items in {this.state.game.name}</Text>
          </View>
          <VrButton onClick={this.exitGame}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Play another game</Text>
            </View>
          </VrButton>
        </View>
      </View>
    )
  }
}
/*The StyleSheet API from React Native can also be used in React 360 to define several
styles in one place rather than adding styles to individual components */

const styles = StyleSheet.create({
  /*In index.js, we will update the default styles generated in the initial React 360
project to add our own CSS rules. In the StyleSheet.create call, we will define
style objects to be used with the components in the game */
  completeMessage: {
    margin: 0.1,
    height: 1.5,
    backgroundColor: 'green',
    transform: [ {translate: [0, 0, -5] } ]
  },
  congratsText: {
    fontSize: 0.5,
    textAlign: 'center',
    marginTop: 0.2
  },
  collectedText: {
    fontSize: 0.2,
    textAlign: 'center'
  },
  button: {
    margin: 0.1,
    height: 0.5,
    backgroundColor: 'blue',
    transform: [ { translate: [0, 0, -5] } ]
  },
  buttonText: {
    fontSize: 0.3,
    textAlign: 'center'
  }
})

AppRegistry.registerComponent('MERNVR', () => MERNVR);
