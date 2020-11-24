import { Command, Hook } from '@oclif/config';
import * as fs from 'fs';

type HookFunction = (this: Hook.Context, options: HookOptions) => any;

type HookOptions = {
    Command: Command.Class;
    argv: string[];
    commandId: string;
    result?: PreDeployResult;
};

type PreDeployResult = {
    [aggregateName: string]: {
        mdapiFilePath: string;
        workspaceElements: {
            fullName: string;
            metadataName: string;
            sourcePath: string;
            state: string;
            deleteSupported: boolean;
        }[];
    };
};

export const hook: HookFunction = async function(options) {
    console.log('PreDepoy Hook Running');

    // Run only on the push command, not the deploy command
    // if (options.commandId === 'force:source:push') {
    if (options.result) {
        console.log(options.result);
    }
    // }
};

export default hook;