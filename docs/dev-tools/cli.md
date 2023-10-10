---
pagination_next: null
pagination_prev: null
---

# CLI

import {RIG_VERSION} from "../../src/constants/versions"

## Install

The following are the different installation options for how to install the CLI

### Homebrew

Add the rig homebrew tap and install the CLI.

```bash
brew tap rigdev/tap
brew install rigdev/tap/rig
```

### Binaries

Rig can be installed manually by downloading a precompiled binary and adding
it to your `$PATH`

Every GitHub release has prebuilt binaries for common platforms and
architectures. Go to [the releases
page](https://github.com/rigdev/rig/releases) to find yours.

### From source

Installation from source requires the go toolchain to be installed.

<pre><code className="language-bash">go install github.com/rigdev/rig/cmd/rig@{RIG_VERSION}</code></pre>

## Authenticate

After installing Rig, you can login to the CLI by running:

```bash
rig auth login --user=your@email.com
```

Then enter the password of your admin user. If you have not created any admin users yet, checkout the [manage admin users guide](/cluster/manage-admin-users) to get started.

If no context is selected, the prompt will help you configure one.

## Projects

Everything done in Rig is done in the context of a project.

To create a new project, run the following command:

```bash
rig project create
```

To change between projects, run the following command:

```bash
rig project use
```

## Contexts

If you work with multiple Rig instances, e.g. both local and production environments, you can configure that by adding multiple contexts to Rig.

To add a new context, run the following command:

```bash
rig config init
```

This will take you through some simple steps to configure your new context.

To switch between contexts, run the following command:

```bash
rig config use-context
```

## Syntax

The Rig CLI is built using Cobra and adheres to the standard syntax of Cobra. The CLI is built hierarchically, where the syntax is as follows:

```sh
rig [module] [command] [arguments] [flags]
```

### Arguments

The commands can have positional arguments. The syntax follows the standards of Cobra with the following syntax:

- `argument`- required argument
- `[argument]` - optional argument
- `argument...` - variadic argument
- `argument1 | argument2` - mutually exclusive arguments
- `{argument1 | argument2}` - delimited mutually exclusive arguments
- `[argument1 | argument2]` - optional mutually exclusive arguments

Many commands require more information than can be provided by arguments. In these cases, the arguments will either be prompted for using an input field, or by selecting from a list of options, or they can be provided using the flags.

### Flags

Flags provide modifiers to control how the command is executed. This can for example be the number of elements to return in a list command, or what field of a resource to update. Flags have default values that will be used if the flag is not specified, and if a meaningful default value does not exist, the value will instead be prompted for. If an abbreviation exists, it can be used as well. The syntax for all flags is as follows:

- `--flag value`
- `-f value` - abbreviation

For all the commands, that retrieve some resource, it is possible to get the response in JSON format by adding the `--json` flag.
