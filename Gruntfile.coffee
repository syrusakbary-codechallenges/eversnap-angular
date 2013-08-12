module.exports = (grunt) ->
    libsSources = [
        'app/js/jquery-1.10.2.js',
        'app/js/lodash-legacy-1.3.1.js',
        'app/js/underscore.string-2.3.0.js',
        'app/js/moment.js',
        'app/js/angular.js',
        'app/js/angular-resource.js',
        'app/js/angular-ui-router.js',
    ]

    appSources = [
        'app/coffee/app.coffee',
        'app/coffee/config.coffee',
        'app/coffee/utils/*.coffee',
        'app/coffee/controllers/*.coffee',
        'app/coffee/services/*.coffee',
        'app/coffee/directives/*.coffee'
    ]

    grunt.initConfig(
        pkg: grunt.file.readJSON('package.json')

        connect: {
            devserver: {
                options: {
                    port: 9001,
                    base: 'app'
                }
            },
        }

        stylus: {
            app: {
                options: {
                    yuicompress: true
                }
                files: {
                    "app/dist/eversnap.css": "app/stylus/eversnap.styl"
                }
            }
        }

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                mangle: false
                report: 'min'
            }

            libs: {
                dest: "app/dist/libs.js"
                src: libsSources
            }

            app: {
                dest: "app/dist/app.js"
                src: "app/dist/_app.js"
            }
        }

        coffee: {
            dev: {
                options: {join: false}
                files: {
                    "app/dist/app.js": appSources
                }
            }

            dist: {
                options: {join: false}
                files: {
                    "app/dist/_app.js": appSources
                }
            }
        }

        concat: {
            options: {
                separator: '',
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            libs: {
                dest: "app/dist/libs.js"
                src: libsSources
            }
        }

        watch: {
            stylus: {
                files: ["app/stylus/*.styl"]
                tasks: ["stylus"]
            }

            app: {
                files: [
                    "app/coffee/**/*.coffee"
                    "app/coffee/*.coffee"
                ]
                tasks: ["coffee:dev"]
            }

            libs: {
                files: ["app/js/*.js"]
                tasks: ["concat:libs"]
            }
        }
    )

    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-stylus')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-contrib-connect')
    grunt.loadNpmTasks('grunt-contrib-jshint')
    grunt.loadNpmTasks('grunt-contrib-htmlmin')
    grunt.loadNpmTasks('grunt-contrib-coffee')

    grunt.registerTask "dev", ["concat:libs", "coffee:dev", "stylus"]
    grunt.registerTask "dist", ["stylus", "uglify"]
    grunt.registerTask "default", ["dev", "connect", "watch"]
