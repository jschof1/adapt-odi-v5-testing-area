# The ODI Adapt Framework Version 5 Testing Area

## What is the purpose of this repository?

This repository allows the ODI to showcase and test Adapt components and the [ODI custom Adapt theme](https://github.com/theodi/adapt-theme-odi).

This repository will help the learning development team at the ODI keep a track of all the *working* components, allowing them to stay on top of versioning. 

Below includes a version tracker table which will help the team keep a track of all the stable component versions :

||||||
|--- |--- |--- |--- |--- |
|Thing|D Version|J Version|Link (if applicable)|Comments|
|Adapt Framework|5.18.1|5.18.0|||
|Authoring tool|0.10.5|0.10.5|||
|Article block slider|3.1.1|3.4.0|||
|Assessment|4.5.3 4.6.1|4.6.1||For GMCQ: tick percentage base Question behavoiur: all three ticked|
|Bookmarking|3.3.1|3.3.3|||
|Developer Tools|3.0.11|3.0.11|||
|Footer Links|0.2.1|0.2.1|https://github.com/theodi/adapt-odi-footerLink||
|Language Picker|4.4.0|4.5.0|||
|Licence terms (in tutor)|0.5.1|0.5.1|https://github.com/theodi/adapt-odi-licence||
|Page level progress|5.3.1|1.9.4|||
|Resources|4.2.0|4.2.0|||
|Simple about page (in tutor)|0.5.2|0.5.2|https://github.com/theodi/adapt-contrib-aboutPage||
|Spoor|3.10.1|4.2.0|||
|Trickle|5.2.3|5.2.6|||
|Tutor|4.0.0|4.0.0|||
|Vanilla theme||5.7.0|https://github.com/adaptlearning/adapt-contrib-vanilla/releases/tag/v5.7.0||
|xAPI|0.8.3-3|0.8.3-3|https://github.com/theodi/adapt-contrib-xapi/tree/odi-guid-0.8.3-cookies||
|ODI Generic (theme)|0.9.22||https://github.com/theodi/adapt-theme-odi-generic/tree/framework-v5||
|Accordion|6.0.0|5.3.0|||
|Assessment results|4.3.1|4.3.1||Question soft Reset when revisit|
|Assesment Results - Moral Machine|||||
|Assessment summary|4.1.1||||
|Blank|3.3.0|3.3.1|||
|Drag n Drop|2.5.0|||We do not need this anymore https://github.com/nachocinalli/adapt-selectchoice.|
|Graphic|5.1.0|5.1.0|||
|GMCQ|5.3.0 6.0.5|5.3.0 6.0.5|||
|Hot Graphic|5.5.0|5.5.2|||
|Matching Question|4.4.2|4.4.2|||
|Multiple Choice Question||4.3.0|||
|Media|5.3.2|5.6.0|||
|Moral Machine|0.0.5||||
|Moral Machine Results|0.1.5||||
|My Game|1.0.0||||
|Narrative|6.5.1|6.5.3|||
|Slider|3.3.2|3.4.0|||
|Text|5.0.0|5.0.0|||
|Text input|5.0.0|5.0.0|||
|iframe|2.1.0|N/A|||
|Box menu|5.3.2||||



## Installation
1. [Grunt](https://gruntjs.com/getting-started), [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/) and [Node.js](https://nodejs.org/en/download/) must be installed on your computer first.

2. Double check they have been installed by `{packageName} -v` on in your terminal. If they are installed the terminal should provide you with the version number you currently have installed:


    `node -v`

Node.js version number should be returned by your terminal
  
    `npm -v`
    
NPM version number should be returned by your terminal

    `grunt -v`
    
Grunt version number should be returned by your terminal

 
3. Once you have confirmed that those packages are installed, download the zip of this repository, found in the top right hand corner. 

4. Unzip the folder.

5. Drag the _unzipped_ folder into the location of your choice.

6. Navigate to this folder in your terminal.

7. Once you are inside the ODI Adapt Version 5 Testing Area folder run `npm i `. This will install all the packages you need to host the testing area locally.

8. Run `grunt build`

9. To exectue the server run `grunt server`

10. Now navigate to `localhost:9005` and you should see the ODI's Adapt testing area.
