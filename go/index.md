# Install Go

In this tutorial, you will install golang on your local computer. Follow the instructions for your operating system:

<todo: go path>

## Mac OS X

* Update brew and install go:
      
    ```sh
    brew update && brew install go
    ```

* To add Go to your terminal path:

    1. Open or create a `~/.bash_profile` file with your favorite command-line text editor.
    2. Add the following lines:

        ```sh
        export GOPATH=$HOME/go
        export PATH=$PATH:$GOPATH/bin
        ```

* To make sure these changes execute, run the following command:

    ```sh
    source ~/.bash_profile
    ```

* Now you are all set. To verify the installation of go, run the following command:

    ```sh
    go version
    ```

## Linux

* First step is to download the latest linux distribution package from https://golang.org/dl/.
* Next is to extract the archive we downloaded into `/usr/local`, create a Go tree in `/usr/local/go`. Before that we will remove previous installation of at /usr/local/go`, if any:

```
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.16.6.linux-amd64.tar.gz
```

* Now next step is to add `/usr/local/go/bin` to the `PATH` environment variable, we can do so by adding this line in `$HOME/.bash_profile`:

```
export PATH=$PATH:/usr/local/go/bin
```

* Next to make sure these changes execute, run the following command in Terminal:

```
source ~/.bash_profile
```

* Verify the installation of golang by typing the following command:

```
go version
```

## Windows

* Download the latest windows package from https://golang.org/dl/.
* Next step is to open the MSI file we downloaded and follow the prompts to install Go.
* To verify the go installation open command prompt from Start menu and type the following  command:

```
go version
```
