---
date: '2021-06-07'
title: A brief intro to git
description: "As a developer, a version control system is a critical part of your toolkit, no matter the size of the project or team you may find yourself working on."
tags: ['Git', 'development']
---

As a developer, a version control system is a critical part of your toolkit, no matter the size of the project or team you may find yourself working on.<!-- excerpt -->

I first started learning to use git by applying it to my own projects and maintaining local repositories to track those projects. From there I moved on to hosting and storing my git repositories at [Bitbucket](https://bitbucket.org) while still working independently. My first experience with working alongside other developers in git came at my first full time development job on a small team (think _tiny_ — two developers, myself included). I picked up the basics of branching, handling merges, developing different features in parallel and, ultimately, dealing with QA and production deployments that were sourced from various branches in our project repository.

I've expanded on my knowledge git in the jobs I've held since that first position and have used [svn](https://subversion.apache.org) pretty heavily as well (I don't mind it, but I don't love it — I'd argue git is the better choice for a number of reasons, its decentralized nature and flexibility being chief among them).

One of the many appeals of git is its flexibility and there are a wide range of commands that come with it. To get started, I'd suggest digging in with the following:

```bash
# initialize git
git init

# clone repo
git clone <repo url>

# view the state of the repo
git status

# this will stage all of your modified and/or untracked files for commit
git add -A

# this will stage only the files that you pass into the command as an argument, delimited by a space
git add <path to file(s)>

# this will commit all modified files and apply the commit message that follows it
git commit -am "<commit message>"

# this will commit only the files that you've staged and apply the message that follows it
git commit -m "<commit message>"

# amend the last commit message
git commit --amend

# this will fetch changes from the remote branch that you're currently on; this will require a merge if your local copy of the branch has diverged from the remote
git pull

# you can also specify arguments and branches with git pull, for example
git pull origin master

# this will checkout a different branch from the branch you're currently on
git checkout <branch name>

# alternatively you can revert the state of your current branch to match the head of that branch, or that of of an individual file
git checkout .

git checkout <path to file>

# check out a new branch, diverging from the current branch
git checkout -b <branch name>

# see available branches
git branch

# delete a branch locally
git branch -d <branch name>

# delete a branch remotely
git push origin --delete <branch name>

# merge a branch into the branch you're currently on
git merge <branch name>

# stash your current changes and return to the head of the branch you're on
git stash

# reapply your stashed changes
git stash apply

# reapply your topmost stashed changes and discard the change set
git stash pop

# show commit logs
git log

# show the reference log of all recent actions
git reflog

# fetch remote branches
git fetch

# throw away uncommitted changes and revert to the head of the branch (destructive command)
git reset --hard HEAD

# back branch up to previous commit
git checkout <commit hash value>

# revert a previous commit
git revert <git commit hash value>
```

Each of these commands has numerous options associated with it and allows for broad control over the flow and history of your project. There are a number of other options I'd suggest for learning more about git:

- [Github's git tutorial](https://try.github.io)
- [Pro Git book](https://git-scm.com/book)
- [Oh shit, git!](http://ohshitgit.com/)
- [Github guides](https://guides.github.com)
- [Git documentation](https://git-scm.com/documentation)
