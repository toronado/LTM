module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {   
            js: {
                src: [
                    'app/build/js/ngApp.js',
                    'app/build/js/ngCtrlMain.js',
                    'app/build/js/ngCtrlIndex.js',
                    'app/build/js/ngDirMarkerAnimate.js',
                    'app/build/js/ngDirMarkerLabel.js'
                ],
                dest: 'app/build/js/ng.js',
            }
        },
        uglify: {
            build: {
                src: 'app/build/js/ng.js',
                dest: 'app/build/js/ng.min.js'
            }
        },
        cssmin: {
            dist: {
                files: {
                    'app/build/css/style.min.css': ['app/styles/*.css'],
                }
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    'app/build/js/ngApp.js': ['app/scripts/app.js'],
                    'app/build/js/ngCtrlMain.js': ['app/scripts/controllers/main.js'],
                    'app/build/js/ngCtrlIndex.js': ['app/scripts/controllers/index.js'],
                    'app/build/js/ngDirGoogleMap.js': ['app/scripts/directives/googleMap.js'],
                    'app/build/js/ngDirMarkerAnimate.js': ['app/scripts/directives/markerAnimate.js'],
                    'app/build/js/ngDirMarkerLabel.js': ['app/scripts/directives/markerLabel.js']
                }
            }
        }
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate'); 

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['cssmin']);

};