# bpmn-js Modeler Example with Multi-Diagram functions

This example uses [bpmn-js](https://github.com/bpmn-io/bpmn-js) to implement a modeler for BPMN 2.0 process diagrams. It serves as the basis of the bpmn-js demo application available at [demo.bpmn.io](http://demo.bpmn.io).

For this particular example the version of bpmn-js was modified on our [branch](https://github.com/sharedchains/bpmn-js/tree/feature/multipleDiagram) to add multi-diagram functionalities on bpmn

## About

This example is a node-style web application that builds a user interface around the bpmn-js BPMN 2.0 modeler.

![demo application screenshot](https://raw.githubusercontent.com/sharedchains/bpmn-js-modeler-demo/master/docs/screenshot.png "Screenshot of the example application")


##  Building

You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) installed to build the project and try our example.

You need to check out also our latest bpmn-js branch version and link it to this project. That’s why we are waiting for bpmn-js integration to create Camunda modeler pull request.
Follow this steps:

- **Clone our bpmn-js repository** from [here](https://github.com/sharedchains/bpmn-js.git), and checkout branch **feature/multipleDiagram**

- Install bpmn-js project dependencies and create a symlink in the global folder
```
npm install
npm link
```

- Go to this project folder and execute
```
npm install
npm link bpmn-js
```
In this way, you linked the ‘compiled’ bpmn-js module to modeler.

- You may also spawn a development setup by executing
```
npm run dev
```

Both tasks generate the distribution ready client-side modeler application into the `public` folder.

Serve the application locally or via a web server (nginx, apache, embedded).
