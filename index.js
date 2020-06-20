const Parser = require('@iamthe-wraith/cmd-line-parser');
const { Logger } = require('@iamthe-wraith/logger');

class Command {
  constructor (props) {
    const {
      pattern = '',
      docs = null
    } = props;

    this.name = pattern.split(' ')[0].replace('<', '').replace('>', '');
    this.parser = new Parser(pattern);
    this.docs = docs;

    this.arguments = {};
  }

  /***
   * this method will be overwritten by any command that needs
   * something to be done before the main piece of execution
   * can run
   *
   ***** IMPORTANT! *****
   * when overwiting this method, it MUST receive
   * the context as its only argument, it MUST return a Promise,
   * and it MUST resolve with the context
   *
   * @param {Object} ctx - the context
   * @return {Promise} - resolves with the [updated] context
   ***/
  before (ctx) {
    return new Promise(resolve => { resolve(ctx); });
  }

  /***
   * this method will be overwritten by any command that needs
   * something to be done after the main piece of execution
   * has run
   *
   ***** IMPORTANT! *****
   * when overwriting this method, it MUST receive
   * the context as its only argument, it MUST return a Promise,
   * and it MUST resolve with the context
   *
   * @param {Object} ctx - the context
   * @return {Promise} - resolves with the [updated] context
   ***/
  after (ctx) {
    return new Promise(resolve => { resolve(ctx); });
  }

  /***
   * this method will be overwritten by all commands and is
   * the main piece of execution for the command
   *
   ***** IMPORTANT! *****
   * when overwiting this method, it MUST receive
   * the context as its only argument, it MUST return a Promise
   * and it MUST resolve with the context
   *
   * @param {Object} ctx - the context
   * @return {Promise} - resolves with the [updated] context
   ***/
  main (ctx) {
    return new Promise((resolve, reject) => {
      Logger.warn('[-] - Command:main has not been overwritten');
      resolve(ctx);
    });
  }

  /***
   * the primary method to call to execute the command
   *
   * @return {Promise} - resolves with the [updated] context
   ***/
  execute (ctx) {
    return this.parser.parse(ctx)
      .then(this.before)
      .then(this.main)
      .then(this.after);
  }

  /***
   * registers a new argument
   *
   * @param {string} name - the name of the argument - structure: <fullName>[|<abbreviatedName>]
   * @param {Object|undefined} opts - optional options
   *
   * @example: Command.argument('foo|f', { type: 'string' });
   ***/
  argument (name, opts) {
    try {
      return this.parser.argument(name, opts);
    } catch (err) {
      Logger.error(err);

      if (err.isFatal) {
        process.errorCode = 1;
      }
    }
  }

  /***
   * registers a new parameter
   *
   * @param {string} name - the name and type of the parameter - (available types: string, int, float, boolean)
   * @param {Object|undefined} opts - optional options
   *
   * @example: Command.parameter('<foo:string>', { ... });
   ***/
  parameter (name, opts) {
    try {
      return this.parser.parameter(name, opts);
    } catch (err) {
      Logger.error(err);

      if (err.isFatal) {
        process.errorCode = 1;
      }
    }
  }

  /***
   * registers a new flag
   *
   * @param {string} name - the name of the flag - structure: <fullName>[|<abbreviatedName>]
   * @param {Object|undefined} opts - optional options
   *
   * @example: Command.flag('foo|f', { ... });
   ***/
  flag (name, opts) {
    try {
      return this.parser.flag(name, opts);
    } catch (err) {
      Logger.error(err);

      if (err.isFatal) {
        process.errorCode = 1;
      }
    }
  }

  help () {
    if (this.docs === null) {
      Logger.warn('[-] no documentation has been written for this command');
    } else {
      Logger.gen('\n*******************************************\n');

      Logger.title(`${this.name}`);
      Logger.gen(`${this.docs}\n`);

      if (Object.keys(this.parser.parameters).length > 0) {
        Logger.gen('parameters (listed in the order they must be entered) :');

        for (const i in this.parser.parameters) {
          const isRequired = this.parser.pattern.filter(pattern => pattern.name === i)[0].required;

          Logger.title(`\t${i} <${this.parser.parameters[i].type}> ${isRequired ? '' : '[optional]'}`);
          Logger.gen(`\t${'description' in this.parser.parameters[i] ? this.parser.parameters[i].description : ''}\n`);
        }
      }

      if (Object.keys(this.parser.arguments).length > 0) {
        Logger.gen('arguments:');

        for (const i in this.parser.arguments) {
          Logger.title(`\t--${i}${'shortHand' in this.parser.arguments[i] && this.parser.arguments[i].shortHand ? `|-${this.parser.arguments[i].shortHand}` : ''} <${this.parser.arguments[i].type}>`);
          Logger.gen(`\t${'description' in this.parser.arguments[i] ? this.parser.arguments[i].description : ''}\n`);
        }
      }

      if (Object.keys(this.parser.flags).length > 0) {
        Logger.gen('flags:');

        for (const i in this.parser.flags) {
          Logger.title(`\t--${i}${'shortHand' in this.parser.flags[i] && this.parser.flag[i].shortHand ? `|-${this.parser.flags[i].shortHand}` : ''}`);
          Logger.gen(`\t${'description' in this.parser.flags[i] ? this.parser.flags[i].description : ''}\n`);
        }
      }

      Logger.gen('\n*******************************************\n');
    }
  }
}

module.exports = Command;
