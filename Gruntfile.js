module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';\n'
			},
			AppKit: {
				src: [
					'src/js/AppKit/Class.js',
					'src/js/AppKit/EventDispatcher.js',
					'src/js/AppKit/NodeClass.js',
					'src/js/AppKit/ScrollPane.js',
					'src/js/AppKit/WebApp.js',
					'src/js/AppKit/PageView.js',
					'src/js/AppKit/Page.js',
					'src/js/AppKit/Menu.js',
					// 'src/libs/sass.sync.js',
					// 'src/js/AppKit/StyleSass.js',
					'src/js/AppKit.js',
				],
				dest: 'dist/AppKit.src.js',
			},
			ak: {
				options: {
					banner: '"use strict";\nconsole.html=s=>{};\n'
				},
				src: [
					'src/ak/NodeClass.js',
					'src/ak/ScrollPane.js',
					'src/ak/Window.js',
					// 'src/ak/WebApp.js',
					'src/ak/PageView.js',
					'src/ak/Page.js',
					'src/ak/Menu.js',
					// 'src/libs/sass.sync.js',
					// 'src/ak/StyleSass.js',
				],
				dest: 'dist/AppKit-namespace.src.js',
			}
		},
		
		uglify: {
			AppKit: {
				files: {
					'dist/AppKit.js': ['dist/AppKit.src.js']
				}
			}
		}
	});

  // Load the plugins that provides the "uglify" task and "concat" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  // Default task(s).
  grunt.registerTask('default', ['concat:', 'concat:ak']);

};
