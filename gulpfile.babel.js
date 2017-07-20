import gulp from 'gulp'
import notify from 'gulp-notify'
import gutil from 'gulp-util'
import livereload from 'gulp-livereload'
import changed from 'gulp-changed'
import concat from 'gulp-concat'
import plumber from 'gulp-plumber'
import imagemin from 'gulp-imagemin'
import minifyCss from 'gulp-minify-css'
import minifyHtml from 'gulp-minify-html'
import rev from 'gulp-rev'
import revCollector from 'gulp-rev-collector'
import del from 'del'
import uglify from 'gulp-uglify'
import connect from 'gulp-connect'
import sass from 'gulp-sass'
import babel from 'gulp-babel'

const paths = {
    htmlSrc: 'src/',
    sassSrc: 'src/styles/',
    imgSrc: 'src/images/',
    jsSrc: 'src/javascripts/',

    buildDir: 'build/',
    revDir: 'rev/',
    distDir: 'dist/'
}

/*
    Errors
*/

const onError = (error) => {
    gutil.beep()
    gutil.log(gutil.colors.red(error))
}

/*
    Server
*/

const igniteServer = () => {
    return connect.server({
        root: 'build',
        livereload: true
    })
}

/*
    Tarefas
*/

gulp.task('b-html', () => {
    return gulp
        .src(paths.htmlSrc.concat('**/*.html'))
        .pipe(gulp.dest(paths.buildDir.concat('/')))
        .pipe(livereload())
})

gulp.task('b-css', () => {
    return gulp
        .src(paths.sassSrc.concat('**/*.scss'))
        .pipe(sass({
            includePaths: require('node-neat').includePaths,
            style: 'nested',
            onError: function() {
                console.log('SASS ERROR')
            }
        }))
        .pipe(plumber({ errorHandler: onError }))
        .pipe(gulp.dest(paths.buildDir.concat('/css')))
        .pipe(livereload())
})

gulp.task('b-js', () => {
    return gulp
        .src(paths.jsSrc.concat('**/*.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(plumber({ errorHandler: onError }))
        .pipe(changed(paths.buildDir.concat('/js')))
        .pipe(gulp.dest(paths.buildDir.concat('/js')))
        .pipe(livereload())
})

gulp.task('b-img', () => {
    return gulp
        .src(paths.imgSrc.concat('**/*.+(png|jpg|jpeg|gif|svg)'))
        .pipe(changed(paths.buildDir.concat('/images')))
        .pipe(gulp.dest(paths.buildDir.concat('/images')))
        .pipe(livereload())
})

gulp.task('watch', () => {
    gulp.watch('src/*.html', ['b-html'])
    gulp.watch('src/styles/**', ['b-css'])
    gulp.watch(paths.jsSrc.concat('**/*.js', ['b-js']))
    gulp.watch(paths.imgSrc.concat('**/*.+(png|jpg|jpeg|gif|svg)'), ['b-img'])
})

gulp.task('build', ['b-html', 'b-css', 'b-js', 'b-img'], () => {
    return igniteServer()
})

const ENV = process.env.SERVER_ENV || 'development'

if (ENV === 'development') {
    gulp.task('default', ['build', 'watch'])
}