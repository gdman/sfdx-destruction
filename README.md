# Important Announcement

SFDX now contains destructive changes support. You no longer need to use this plugin.

Use the following arguments:

`--predestructivechanges <filepath>`

`--postdestructivechanges <filepath>`

---
---

sfdx-destruction
================

Destructive changes support for `sfdx force:source:deploy` via a predeploy hook.

At time of writing, the `sfdx force:source:deploy` command doesn't support destructive changes files out of the box. Therefore if deletions are required, either source metadata needs to be converted for use with `sfdx force:mdapi:deploy` or there'll need to be multiple deployments (with downtime, difficult rollbacks and multiple unit test cycles).

This simple plugin hooks into source deploy and drops `destructiveChangesPre.xml` and/or `destructiveChangesPost.xml` deletions manifests into the package before the deployment initiates.

[![Version](https://img.shields.io/npm/v/sfdx-destruction.svg)](https://npmjs.org/package/sfdx-destruction)
[![Known Vulnerabilities](https://snyk.io/test/github/gdman/sfdx-destruction/badge.svg)](https://snyk.io/test/github/gdman/sfdx-destruction)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-destruction.svg)](https://npmjs.org/package/sfdx-destruction)
[![License](https://img.shields.io/npm/l/sfdx-destruction.svg)](https://github.com/gdman/sfdx-destruction/blob/master/package.json)

# Installation

```sh-session
$ sfdx plugins:install sfdx-destruction
```

# Usage

```sh-session
$ SFDX_DESTRUCTION_ENABLE=true sfdx force:source:deploy
```

# Configuration

Destructive changes functionality is disabled by default and therefore must be enabled by environment variable or in the project configuration file.

If the `SFDX_DESTRUCTION_ENABLE` environment variable is set, it will be used to determine whether to run the plugin (true or false and regardless of configuration file settings).  
Else the `plugins` -> `sfdx-destruction` -> `enabledByDefault` variable in the project configuration file will be used (if set).  
If neither is configured, the plugin will remain disabled.  

The locations of the pre and post destructive changes files can also be specified by environment variable and/or configuration file. Environment variables take precedence over the configuration file. If neither is present, the plugin will have no effect.

Recommended usage is to use the configuration file to store the locations of the destructive changes files and the environment variable to enable at build time.

## Environment Variables

`SFDX_DESTRUCTION_ENABLE` - true or false to enable or disable the plugin

`SFDX_DESTRUCTION_PRE_FILE` - path to the destructive changes pre file i.e. deletions that will occur before the deployment

`SFDX_DESTRUCTION_POST_FILE` - path to the destructive changes post file i.e. deletions that will occur after the deployment

## Project Configuration File (sfdx-project.json)

`enabledByDefault` - true or false - will be used to determine whether the plugin should run if no environment variable is present (default: false - disabled)

`preFile` - path to the destructive changes pre file i.e. deletions that will occur before the deployment

`postFile` - path to the destructive changes post file i.e. deletions that will occur after the deployment

### Example:
```json
{
  "packageDirectories": [
    {
      "default": true,
      "path": "force-app"
    }
  ],
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "50.0",
  "plugins": {
    "sfdx-destruction": {
      "enabledByDefault": false,
      "preFile": "{path-to-destructiveChangesPre.xml}",
      "postFile": "{path-to-destructiveChangesPost.xml}"
    }
  }
}
```

# Can I enable the plugin by command line argument?

No, unfortunately not.

This functionality is implemented as a hook and although it is possible to access argv, it doesn't seem to be possible to define additional arguments. Passing in an extra argument will return an error of `Unexpected argument`.
