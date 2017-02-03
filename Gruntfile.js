module.exports = function (grunt) {
  grunt.initConfig({
    clean: ['build'],
    tslint: {
      options: {
        // can be a configuration object or a filepath to tslint.json
        configuration: 'tslint.json',
        // If set to true, tslint errors will be reported, but not fail the task
        // If set to false, tslint errors will be reported, and the task will fail
        force: false,
        fix: false
      },
      files: {
        src: [
          'src/**/*.ts',
          'test/**/*.ts'
        ]
      }
    },
    ts: {
      default : {
        tsconfig: true
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-tslint')
  grunt.loadNpmTasks('grunt-ts')

  grunt.registerTask('default', ['clean', 'ts'])
}
