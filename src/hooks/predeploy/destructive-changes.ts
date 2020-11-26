import { Command, Hook } from '@oclif/config';
import { UX } from '@salesforce/command';
import { SfdxProject } from '@salesforce/core';
import * as fs from 'fs';
import * as path from 'path';

type HookFunction = (this: Hook.Context, options: HookOptions) => unknown;

type HookOptions = {
    Command: Command.Class;
    argv: string[];
    commandId: string;
    result?: PreDeployResult;
};

type PreDeployResult = {
    [aggregateName: string]: {
        mdapiFilePath: string;
    };
};

type PluginConfig = {
    enabledByDefault?: boolean;
    preFile?: string;
    postFile?: string;
};

const TEMP_PACKAGE_DIR         = 'sourceDeploy_pkg';
const DESTRUCTIVE_CHANGES_PRE  = 'destructiveChangesPre.xml';
const DESTRUCTIVE_CHANGES_POST = 'destructiveChangesPost.xml';

export const hook: HookFunction = async function(this, options): Promise<void> {

    try {
        if (options.commandId !== 'force:source:deploy' || !options.result) {
            return;
        }

        const ux = await UX.create();

        if (!(await isPluginEnabled())) {
            ux.log('SFDX destructive changes plugin installed but not active');
            return;
        }

        const mdapiElementNames = Object.keys(options.result);

        if (mdapiElementNames.length === 0) {
            return;
        }

        ux.log('SFDX destructive changes plugin enabled');

        const mdapiFilePath = options.result[mdapiElementNames[0]].mdapiFilePath;
        const packageDirPath = getPackagePath(mdapiFilePath);

        const preFile = await getDestructiveChangesPreFile();
        if (preFile) {
            ux.log('Adding', preFile, 'to package');
            copyDestructiveChanges(preFile, path.join(packageDirPath, DESTRUCTIVE_CHANGES_PRE));
        }

        const postFile = await getDestructiveChangesPostFile();
        if (postFile) {
            ux.log('Adding', postFile, 'to package');
            copyDestructiveChanges(postFile, path.join(packageDirPath, DESTRUCTIVE_CHANGES_POST));
        }
    } catch (ex) {
        this.error(ex, { exit: 1 });
    }
};

export default hook;

const getPluginConfig = async (): Promise<PluginConfig> => {
    const project = await SfdxProject.resolve();
    const projectJson = await project.resolveProjectConfig();

    return projectJson?.plugins?.['sfdx-destruction'] || {};
};

const isPluginEnabled = async (): Promise<boolean> => {
    if ('SFDX_DESTRUCTION_ENABLE' in process.env) {
        return (process.env['SFDX_DESTRUCTION_ENABLE'] || '').toLowerCase() === 'true';
    } else {
        const pluginConfig = await getPluginConfig();
        return pluginConfig.enabledByDefault === true;
    }
};

const getDestructiveChangesPreFile = async (): Promise<string> => {
    if ('SFDX_DESTRUCTION_PRE_FILE' in process.env) {
        return process.env['SFDX_DESTRUCTION_PRE_FILE'];
    } else {
        const pluginConfig = await getPluginConfig();
        return pluginConfig.preFile;
    }
};

const getDestructiveChangesPostFile = async (): Promise<string> => {
    if ('SFDX_DESTRUCTION_POST_FILE' in process.env) {
        return process.env['SFDX_DESTRUCTION_POST_FILE'];
    } else {
        const pluginConfig = await getPluginConfig();
        return pluginConfig.postFile;
    }
};

const getPackagePath = (mdapiFilePath: string): string => {
    const packageDirName = mdapiFilePath.split(path.sep).find(dir => dir.includes(TEMP_PACKAGE_DIR));

    if (!packageDirName) {
        throw new Error('Failed to locate package directory');
    }

    return mdapiFilePath.substring(0, mdapiFilePath.indexOf(packageDirName) + packageDirName.length);
};

const copyDestructiveChanges = (destructiveChangesFile: string, packageDirPath: string): void => {
    if (!fs.existsSync(destructiveChangesFile)) {
        throw new Error('Destructive changes file not found! (' + destructiveChangesFile + ')');
    }

    fs.copyFileSync(destructiveChangesFile, packageDirPath);
};
