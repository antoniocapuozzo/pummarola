# Pummarola 🍅

A rapid boilerplate for frontend web development with Pug, Sass and Babel

Built using npm scripts: without tasks runner (gulp, grunt) or module bundler (webpack, parcel).

## Getting ready

### Setup

Make sure you have NPM installed. If not, NPM comes with Node and can be downloaded [here](https://nodejs.org/en/download/).

Clone the repo and install all dependencies using:

```
$ git clone https://github.com/antoniocapuozzo/pummarola.git && cd pummarola
```

### Most common commands are:

* **`npm install --silent`** For installing needed dependencies 

* **`npm start`** For developing (watches for changes)

* **`npm run build`** For publishing (minify & optimisation)

* **🍿 Party time!** 



## Resources

- [Pug](https://pugjs.org)
- [Sass](https://sass-lang.com)
- [PostCSS](https://postcss.org)
- [Babel](https://babeljs.io)
- [BrowserSync](https://www.browsersync.io)

## Directory structure

```bash

🍅

└───public
    │
    ├───assets
    │   │
    │   ├─── script
    │   │    └─── app.js 
    │   │
    │   ├─── style
    │   │    └─── app.css 
    │   │
    │
    └─── index.html    


└───source
    │
    ├───html
    │   │  
    │   ├───layout
    │   │   └─── base.pug
    │   │
    │   ├───pages
    │   │   └─── index.pug
    │   │
    │   ├───utils
    │   │   └─── date.pug
    │   │   └─── ipsum.pug
    │   │   └─── loop.pug
    │   │   └─── placeholder.pug
    │
    ├───script
    │   └─── utils.js
    │   └─── app.js 
    │
    ├───style
    │   │  
    │   ├───layout
    │   │   └─── reset.scss
    │   │
    │   └─── app.scss 
        
```

**This documentation is currently in progress**

***Last update: 10/10/2019***