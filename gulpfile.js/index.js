const gulp = require('gulp');
// Css Transforms
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-cssnext');
const sourcemaps = require('gulp-sourcemaps');

const cssnano = require('cssnano');
// Ts Transforms
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json')

const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const fancy_log = require('fancy-log');
const watchify = require('watchify');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');


const paths = {
    styles:{
        src:'./sass/*.scss',
        dest:'./dist/css'
    },
    script:{
        src:'./src/*.ts',
        dest:'./dist/js'
    },
    pages:{
        src:'./*.html',
        dest:'./dist'
    },
}

function copyHtml (){
    return gulp.src(paths.pages.src)
    .pipe(gulp.dest(paths.pages.dest))
}
let watchedBrowserify = watchify(browserify({
    baseDir:'.',
    debug:true,
    entries:['src/main.ts'],
    cache:{},
    packageCache:{}
})
.plugin(tsify)
.transform('babelify', 
{
    presets: ['es2015'],
    extensions: ['.ts']
}
))

function bundle(){
    return watchedBrowserify
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps:true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.script.dest))
}
function style(){
    return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on('error',sass.logError)
    .pipe(postcss([cssnext(),cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
}





let build = gulp.parallel(style,gulp.series(gulp.parallel(copyHtml),bundle));
watchedBrowserify.on('update',bundle);
watchedBrowserify.on('log',fancy_log)
gulp.task('build',build);
gulp.task('default',build);