module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {   
            cssLib: {
                src: [
                    'app/styles/bootstrap.min.css',
                    'app/styles/font-awesome.min.css',
                    'app/styles/animate.min.css'
                ],
                dest: 'app/styles/libs.min.css'
            },
            jsLib: {
                src: [
                    'app/scripts/lib/jquery.min.js',
                    'app/scripts/lib/angular.min.js',
                    'app/scripts/lib/angular-route.min.js',
                    'app/scripts/lib/markerAnimate.min.js'
                ],
                dest: 'app/scripts/lib/libs.min.js'
            },
            jsAng: {
                src: [
                    'app/scripts/app.js',
                    'app/scripts/controllers/main.js',
                    'app/scripts/controllers/index.js',
                    'app/scripts/directives/googleMap.js'
                ],
                dest: 'app/scripts/ng.js'
            }
        },
        uglify: {
            build: {
                src: 'app/scripts/lib/markerAnimate.js',
                dest: 'app/scripts/lib/markerAnimate.min.js'
            }
        },
        cssmin: {
            dist: {
                files: {
                    'app/styles/main.min.css': ['app/styles/main.css']
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
        },
        watch: {
            styles: {
                files: ['app/styles/main.css'],
                tasks: ['cssmin'],
                options: {
                    spawn: false
                }
            } 
        }
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate'); 
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['cssmin']);

};