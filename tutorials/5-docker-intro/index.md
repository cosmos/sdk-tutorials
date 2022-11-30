---
parent:
  title: Docker Introduction
  description: Know your way around Docker
  number: 
tags:
  - tutorial
  - dev-ops
order: 0
title: Docker Introduction
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">Know your way around Docker</div>
<h1 class="mt-4 mb-6">Docker Introduction</h1>

[Docker](https://www.docker.com) is a kind of computer virtualization that provides valuable performance benefits.

## Concepts

Being different from classic forms of virtualization, Docker introduces new concepts with their vocabulary.

Take a look at two of them: containers and images.

### Containers

You know how a **computer** operates: it uses a disk and memory to run an operating system and the programs within it.

You know how a **virtual machine** works: its computer host offers a _virtual_ disk and memory, and the virtual machine uses both to run its own operating system and programs. Virtualization mimics a full computer, which requires disk space and memory. It also takes time to start because the virtualized operating system needs to start from scratch.

Docker uses a feature of Linux called [_namespaces_](https://docs.docker.com/get-started/overview/#the-underlying-technology) and _control groups_. With this feature, Linux can launch programs (even low-level ones of the operating system) in an environment where the programs believe they are in a complete Linux environment on their own, i.e. sandboxed. This is also called containerization. A **container** does not have full disk or full memory access to its host (the Linux environment that started it), only to a subset of it. A Linux system can launch multiple containers at a time.

As opposed to proper virtualization, containerization is fast:

* You do not need to start a whole operating system, only to isolate a new container and run its own programs. You now count the start-up time in seconds instead of minutes.
* The memory used by the container is only that of the programs it runs while benefiting from the rest of the Linux system in an isolated way.

### Images

Instead of a virtual disk with a full operating system, a container starts from an **image**. The image contains the files that are specific to the container and different from its Linux host. Think of tracing paper recording only the differences laid on top of the host's file system. These differences can be very small.

You can either create images locally via a **`Dockerfile`** containing the commands that create the image, or you can use an existing image.

<HighlightBox type="info">

There exist registries that store and/or reference them, like your regular package manager. [Docker Hub](https://hub.docker.com) is the main one, and your local Docker knows how to download directly from it.

</HighlightBox>

This introduces an interesting concept whereby [a machine is described as a file](https://twitter.com/FrancescoCiull4/status/1509458241524224005), which is very useful for reproducibility and DevOps. Further, the images are optimized so that each image is a _diff_ of a parent one.

Images can be versioned and even referenced by their content hash so that you can be sure to use the expected one. For instance, [Node.js](https://hub.docker.com/_/node) has a long list of images. Do you want [Node 19.1](https://hub.docker.com/layers/library/node/19.1/images/sha256-fcf7d55d2bea9d86f6890a8c44aec9a9ae2cb8f6351aae50e9d684fc81a4415f), or [Node 19.1 built specifically on Debian Buster](https://hub.docker.com/layers/library/node/19.1-buster/images/sha256-9d37aa88366e0a26b621c84e6cb9aff5bee5589d1e783f84d053f7ffe93cfb82)?

Because images contain files to be executed, the files also need to have been compiled for the CPU architecture of your Linux machine. This is why images are often uploaded in different "OS/ARCH" versions, as can be seen [in the Node 19.1 page](https://hub.docker.com/layers/library/node/19.1-buster/images/sha256-9d37aa88366e0a26b621c84e6cb9aff5bee5589d1e783f84d053f7ffe93cfb82?context=explore).

For the avoidance of doubt:

* An image is read-only, and when your container starts its read-write file system is a separate entity.
* More than one container can be started from the same image at the same time.

## How to use it

What if you do not have a Linux operating system? Not to worry, Docker simplifies your life by installing and running a virtual machine running a barebones Linux on your host computer.

After installation, when you want to use Docker, you _start Docker_ - you start the virtual machine running Linux, which is the part that takes time. After it has started, you can use commands to run containers. When you no longer need to use Docker, you can stop it and regain the memory it used.

In these tutorials, you will come across a lot of Docker commands, so it makes sense to familiarize yourself with them.

First, [install it](https://www.docker.com/get-started). Next start Docker.

When it has started you can run your first container. For instance, with Node.js' `lts-slim` image:

```sh
$ docker run -it node:lts-slim
```

`-it` is short for `--interactive --tty` and means "with input and output", instead of a fully detached container. Learn more with `docker run --help`. This should return you a Node.js prompt:

```javascript
Welcome to Node.js v18.12.1.
Type ".help" for more information.
>
```

Version 18 is a long-term support (`lts`) version. If you type `.help`, it will tell you what you need. Exit with `.exit`.

That was fast. What happened?

Docker downloaded the image from the hub and launched it. By default, the image is configured so that the container launches `node`, which is what you got. You did not do anything interesting, though. Yet.

### Open a shell

What if you want to connect to your container with a shell? After all, this is running Linux. Because this image defines Node as its [**entrypoint**](https://hub.docker.com/layers/library/node/lts-slim/images/sha256-3139aa3e8915e7c135623498d29f20a75ee3bfc41cf321ceaa59470b2fffc1a5?context=explore), you need to override it:

```sh
$ docker run -it --entrypoint bash node:lts-slim
```

Now you see something different:

```sh
root@bd3982cf3d68:/#
```

You are `root`! But you are `root` **only in the container**, not in the Linux host. Typically, programs running in a container are left running with `root`, as the container takes care of the isolation.

The image `node:lts-slim`, as the `slim` part indicates, does not have much else besides Node. Try:

```sh
$ curl
```

It should tell you:

```txt
bash: curl: command not found
```

This means that you need to pick your image carefully, and even then sometimes you will also have to install the tools you need. Exit with a regular `exit`.

### Your own image

Suppose you need a Node container with the `curl` command available. For that, you need to **build** your image. It so happens that `node:lts-slim` is built on Debian, so you can use `apt-get` to install new programs.

Create a new file named `Dockerfile` with:

```Dockerfile
FROM node:lts-slim

RUN apt-get update
RUN apt-get install -y curl
```

You have to `update` the package registry because the image is kept slim by not even having a local copy. Build your new image with a name of your choosing:

```sh
$ docker build . -t node-with-curl:lts-slim
```

Now your image is ready.

Can you call up `curl`? Type:

```sh
$ docker run -it --entrypoint curl node-with-curl:lts-slim
```

It should return:

```txt
Use "--help category" to get an overview of all categories.
For all options use the manual or "--help all".
```

So yes, you now have `curl` and Node in the same container.

### Hello World

What if you wanted to use Node to print `Hello World`? Create the JavaScript file that can do that:

```sh
$ echo "console.log(\"Hello World\");" > test.js
```

Now pass it to your container:

```sh
$ docker run -it node:lts-slim test.js
```

This does not work:

```txt
Error: Cannot find module '/test.js'
```

This is because Docker took the words `test.js` and passed them to Node as a string within the context of the container, which has no `test.js`. In effect, the container ran `node test.js`. The file is currently only on your host computer.

Try again:

```sh
$ docker run -it node:lts-slim < test.js
```

Here the content of the file is being passed via StdIn. It should still complain:

```txt
the input device is not a TTY
```

So remove `-t`:

```sh
$ docker run -i node:lts-slim < test.js
```

This time it prints:

```txt
Hello World
```

### Sharing folders

Shared folders are called **volumes**. Instead of sending the content of `test.js` to the container via StdIn, it could be more judicious to let the container have access to your file directly. Try again, this time by sharing your local folder (`pwd`) with the container, and mounting it at `/root/temp` inside the container:

```sh
$ docker run -it -v $(pwd):/root/temp node:lts-slim test.js
```

It should complain again:

```txt
Error: Cannot find module '/test.js'
```

To progress, you also have to tell it to work (`-w`) in the right folder: `/root/temp`, which you created to access your local files:

```sh
$ docker run -it -v $(pwd):/root/temp -w /root/temp node:lts-slim test.js
```

This time it returns:

```txt
Hello World
```

## Clean up

You ran quite a few commands. Where did your containers go?

```sh
$ docker ps --all
```

You should see a long list like this:

```txt
CONTAINER ID   IMAGE           COMMAND                  CREATED          STATUS                        PORTS     NAMES
b5930aef7e7a   node:lts-slim   "docker-entrypoint.s…"   2 minutes ago    Exited (0) 2 minutes ago                angry_babbage
e3f58f2cb118   node:lts-slim   "docker-entrypoint.s…"   5 minutes ago    Exited (0) 5 minutes ago                affectionate_elgamal
...
```

All have stopped and exited. When you create a container, it is not removed by default so it can be reused (see `docker exec --help`). For now, you should clean up these pointless containers - **however**, if you have containers that are not part of this introduction, do not run the command:

```sh
$ docker container prune
```

<HighlightBox type="best-practice">

Having many stopped containers is not ideal, which is why when you want to run a container for a single command the practice is to add `--rm`, like so:

```sh
$ docker run --rm -it -v $(pwd):/root/temp -w /root/temp node:lts-slim test.js
```

Including `--rm` automatically removes the container at the moment it is stopped and exited. You can confirm that there are no remaining containers.

</HighlightBox>

What about the images?

```sh
$ docker image ls
```

There you should see your images too:

```txt
REPOSITORY       TAG        IMAGE ID       CREATED          SIZE
node-with-curl   lts-slim   0c75a35d23de   12 minutes ago   266MB
node             lts-slim   103943353fa6   9 days ago       241MB
```

You can delete them, in any order, with:

```sh
$ docker image rm node-with-curl:lts-slim
$ docker image rm node:lts-slim
```

This concludes your introduction to Docker.

<HighlightBox type="reading">

**Further reading**

* [Under the hood](https://www.codementor.io/blog/docker-technology-5x1kilcbow).

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* What are Docker images and containers.
* How to use a container.
* How to share folders via volumes.
* How to create an image.
* How to clean up.

With these basics, you are equipped to handle the Docker examples of the tutorials.

</HighlightBox>
