const BYTES_BASED_VALUES = ['JSHeapUsedSize', 'JSHeapTotalSize'];

const DEFAULT_VIEWPORT_SIZE = {
    HEIGHT: '1080',
    WIDTH: '1920',
};

const DEFAULT_REPEAT_TIMES = 5;

const URL_REGEX = /([a-z]{1,2}tps?):\/\/((?:(?!(?:\/|#|\?|&)).)+)(?:(\/(?:(?:(?:(?!(?:#|\?|&)).)+\/))?))?(?:((?:(?!(?:\.|$|\?|#)).)+))?(?:(\.(?:(?!(?:\?|$|#)).)+))?(?:(\?(?:(?!(?:$|#)).)+))?(?:(#.+))?/g;

module.exports = {
    BYTES_BASED_VALUES,
    DEFAULT_VIEWPORT_SIZE,
    DEFAULT_REPEAT_TIMES,
    URL_REGEX,
};
