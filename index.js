const PluginTitle = 'ForbiddenImportsPlugin'

class ForbiddenImportsPlugin {
    constructor(optionsArr) {
        this.optionsArr = Array.isArray(optionsArr) ? optionsArr : [optionsArr];
        this.optionsArr.forEach(option => {
            if(option !== Object(option)){
                throw new Error("ForbiddenImportsPlugin accepts a configuration object or an array of objects")
            }
            if (!option.target) {
                throw new Error("target is required in ForbiddenImportsPlugin's configuration")
            }
            if (!option.issuer) {
                throw new Error("issuer is required in ForbiddenImportsPlugin's configuration")
            }
            if (option.level) {
                if (option.level !== 'warning' && option.level !== 'error') {
                    throw new Error("level can be 'warning' or 'error' in ForbiddenImportsPlugin's configuration")
                }
            } else {
                option.level = 'warning'
            }
        })

    }

    createError(problem){
        return new Error("ForbiddenImportsPlugin \nForbidden import found! \n" + 
        "Module: " + problem.issuer + " \n" +
        "Requires: " + problem.target)
    }

    apply(compiler) {
        let plugin = this

        compiler.hooks.compilation.tap(PluginTitle, (compilation) => {

            compilation.hooks.optimizeModules.tap(PluginTitle, (modules) => {


                for (let module of modules) {

                    const options = plugin.optionsArr.filter(option => option.issuer.test(module.resource));

                    const shouldSkip = module.resource == null || options.length == 0


                    // skip the module 
                    if (shouldSkip) {
                        continue
                    }

                    let problems = [];

                    for (let dependency of module.dependencies) {
                        let depModule = dependency.module
                        if (!depModule) { continue }
                        // ignore dependencies that don't have an associated resource
                        if (!depModule.resource) { continue }

                        problems = problems.concat(options.map(option => {
                            if (option.target.test(depModule.resource)) {
                                return {
                                    target: depModule.resource,
                                    issuer: module.resource,
                                    level: option.level
                                }
                            } else {
                                return null;
                            }
                        }))
                    }

                    problems.filter(problem => problem)
                        .forEach(problem => {
                            if (problem.level === 'warning') {
                                compilation.warnings.push(this.createError(problem))
                            } else if (problem.level === 'error') {
                                compilation.errors.push(this.createError(problem))
                            }
                        })
                }
            })
        })
    }

}

module.exports = ForbiddenImportsPlugin