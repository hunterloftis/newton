module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
      uglify: {
        newton_min: {
          files: {
            'newton.min.js': ['src/**/*.js']
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
            mangle: false
          }
        }
      },
      watch: {
        scripts: {
          files: ['src/**/*.js'],
          tasks: ['uglify'],
          spawn: false
        }
      }
    });

    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('dev', ['uglify', 'watch']);

};
