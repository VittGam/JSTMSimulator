# JSTMSimulator

A Turing Machine simulator written in JavaScript. It should work on Chrome and Firefox, as well as IE 6 through 10. Testing by the developer is usually done on Chrome and IE 6.

This simulator has been written from scratch and it's based on the design and functionality of the Java simulator developed by Antonio Cisternino (http://mdt.di.unipi.it/TMSimulatore/TMSimulator-1.2.zip).

For the machine syntax, I'm going to write it in the wiki. In the meantime, please refer to the documentation contained in the zip file of the original Java version (in Italian).

## Online Version

You can find it on http://www.turingsimulator.net/.

## How to compile

To get the sources you need to have Git installed on your computer.

```
git clone git://github.com/VittGam/JSTMSimulator.git
```

You'll need NodeJS (I'm using v0.8.20) with the following modules: (install with `npm install module_name`)

- `uglifycss`
- `uglify-js`

To compile the simulator just run:

```
node build_simulator.js
```

You'll find the compiled simulator in `out/jstmsimulator.htm`.

## The contest server

To run the contest server you need to get the JSON3 submodule:
```
git submodule init
git submodule update
```

Then you'll also need to install the following NodeJS modules:

- `async`
- `express`
- `sanitizer`
- `sqlite3`

After you've done with the prerequisites, first create the database by editing and running the file:

```
node server/init_contest_database.sample.js
```

Then run:

```
node server/server.js
```

The contest server listens by default on `0.0.0.0:8081`, and the admin server on `0.0.0.0:8082`.
The admin server default credentials are `admin:admin`.

To generate the contest result pages run:

```
node server/build_results.js
```

You'll find them in `server/results/GENERATION_TIMESTAMP`.

## TODO

- Contest admin interface interactivity (to add problems, users and testcases on-the-fly)
- htaccess and htpasswd generation in server/build_results.js

Any suggestion? Please create an issue or a pull request, or drop me a line at `vittgam {at} turingsimulator {dot} net`. Thanks!

## License

The MIT license. Please see the `LICENSE` file for more details.
