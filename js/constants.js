const DEFAULT_VIEWPORT_SIZE = {
    HEIGHT: '1080',
    WIDTH: '1920',
};

const DEFAULT_REPEAT_TIMES = 5;

const URL_REGEX = /([a-z]{1,2}tps?):\/\/((?:(?!(?:\/|#|\?|&)).)+)(?:(\/(?:(?:(?:(?!(?:#|\?|&)).)+\/))?))?(?:((?:(?!(?:\.|$|\?|#)).)+))?(?:(\.(?:(?!(?:\?|$|#)).)+))?(?:(\?(?:(?!(?:$|#)).)+))?(?:(#.+))?/g;

module.exports = {
    DEFAULT_VIEWPORT_SIZE,
    DEFAULT_REPEAT_TIMES,
    URL_REGEX,
};
