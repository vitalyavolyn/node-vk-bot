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
          'src/**/*.ts'
        ]
      }
    },
    ts: {
      default: {
        tsconfig: true
      }
    },
    mochaTest: {
      test: {
        options: {
          require: 'ts-node/register',
          timeout: 5000
        },
        src: ['test/**/*.ts']
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-tslint')
  grunt.loadNpmTasks('grunt-ts')
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('default', ['clean', 'ts'])
  grunt.registerTask('test', ['tslint', 'mochaTest'])
}
