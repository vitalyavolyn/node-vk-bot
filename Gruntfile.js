module.exports = function (grunt) {
  grunt.initConfig({
    clean: ['build']
  })

  grunt.loadNpmTasks('grunt-contrib-clean')

  grunt.registerTask('default', ['clean'])
}
