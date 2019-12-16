var log4js = require("log4js");
var config = require("./server");
log4js.configure(
    {
      appenders: {
        file: {
          type: 'file',
          filename: 'marking.log',
          maxLogSize: 10 * 1024 * 1024, // = 10Mb
          backups: 5, // keep five backup files
          compress: true, // compress the backups
          encoding: 'utf-8',
          mode: 0o0640,
          flags: 'w+'
        },
        out: {
          type: 'stdout'
        }
      },
      categories: {
        default: { appenders: ['file',  'out'], level: 'debug' }
      }
    }
  );
 const logger= log4js.getLogger();
logger.level = config.loglevel;
exports.logger = logger