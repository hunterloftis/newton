module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sync-pkg');
    grunt.loadNpmTasks('grunt-release');

    grunt.initConfig({
      uglify: {
        newton_min: {
          files: {
            'newton.min.js': ['src/**/*.js']
          },
          options: {
            report: 'gzip'
          }
        },
        newton: {
          files: {
            'newton.js': ['src/**/*.js']
          },
          options: {
            beautify: {
              width: 80,
              beautify: true
            },
            mangle: false,
            sourceMap: 'newton-map.js'
          }
        }
      },
      watch: {
        scripts: {
          files: ['src/**/*.js'],
          tasks: ['uglify:newton'],
          spawn: false
        }
      },
      sync: {
        include: ['name', 'version', 'main']
      },
      release: {

      }
    });

    grunt.registerTask('dev', ['uglify:newton', 'watch']);
    grunt.registerTask('build', ['uglify:newton', 'uglify:newton_min']);
    grunt.registerTask('publish', ['build', 'release']);
};
