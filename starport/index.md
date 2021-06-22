---
parent:
  title: Install Starport
order: 0
description: Install a specific version of Starport.
---

Each Cosmos SDK tutorial is written for a specific version of [Starport](https://docs.starport.network/). 

**Important** Tutorials are based on a specific version of Starport and are not supported for other versions. Be sure to install and verify your Starport version. 

# Introduction 

The Starport tool is the easiest way to build a blockchain and accelerate chain development.

To upgrade your Starport installation, see [Install Starport](https://docs.starport.network/intro/install.html).

# Install a Specific Version of Starport

You can specify a specific version in the curl command.

For example, to install `starport` v0.15.1, run the following command:

```sh
curl https://get.starport.network/starport@v0.15.1! | bash
```

# Install the Latest Version of Starport

To install the latest stable version, run the following command:

```sh
curl https://get.starport.network/starport! | bash
```

# Verify Your Version 

To verify the version of Starport you have installed:

```sh
starport --version
```
The results show the release details. For example:

```code
starport version v0.16.1 darwin/amd64 -build date: 2021-05-31T13:21:26Z
```

# Installation Result

The starport binary is downloaded from the Github repo and installed in `/usr/local/bin`. 

When the installation succeeds, you see this message:

```
Installed at /usr/local/bin/starport
```




