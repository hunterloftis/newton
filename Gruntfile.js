module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');

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
            }
          }
        }
      }
    });

    grunt.registerTask('default', ['uglify']);

};
