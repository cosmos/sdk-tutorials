---
order: 2
---

# Troubleshooting the Polling App

The polling app tutorial involves many steps. Use these troubleshooting tips to identify and correct issues.

## Your Blockchain App is Locked

**Problem** The voter app in Vue is locked. ![voter locked screenshot](./voter-locked.png)

**Cause** The front end app automatically locks when the app is reset.

**Solution**

There are two parts to unlocking the voter app.

1. Click the Locked element to expose the lock icon, and then click the lock icon. Enter the password you created when you named your wallet `voter` in the [Sign in as Alice](./voter/#sign-in-as-alice) step.
2. Make sure that your blockchain app is running in the terminal window where you launched the voter app with the `starport serve` command. If the app is not running, launch it again. Run the `starport serve` command in the `voter` directory.

### Building proto... cannot build app errors

**Symptom** You might have introduced syntax errors or types when you made the required updates to the code files.

Verify the syntax of the changes you made in the *.go files.

Waiting for a fix before retrying... 🛠️ Building proto... cannot build app:
