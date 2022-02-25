---
title: "Cryptography Theory"
order: 3
description: The Mathematics of Cryptography
tag: fast-track
---

## Theory

### RSA

RSA(Rives, Shamir, Adleman) is a public-key cryptosystem that was first published in 1977. The premise is that if you have a public key ```$$(pubKey,n)$$``` and a private key ```$$priKey$$``` then you can do the following operations on very large numbers:

* encrypt a message:

`$$message ^ {pubKey} \equiv encMessage \mod n$$`

* decrypt the encrypted message:

`$$encMessage ^ {priKey} \equiv message \mod n$$`

Of course, you need to have `$n$` large enough so as not to destroy the `$message$`'s information. Notice also that to encrypt, you need to know both `$pubKey$` and `$n$`, that is the pair that needs to be public knowledge. The `$priKey$`, as ever, is to be protected.

If you want to express that in terms of a theorem, you would say that:

> there exists a triplet `$(priKey, pubKey, n)$` such that for any `$message$`, we get `$(message ^ {pubKey}) ^ {priKey} \equiv message \mod n$`, with the additional hurdle that calculating `$priKey$` out of `$(pubKey, n)$` is computationally expensive and in practice impossible.

Let us work out in detail how you create such a triplet.

#### How

How can we calculate such a triplet of `$(pubKey, n)$` and `$priKey$`? Of course, the difficulty and the art was in finding the following solution, and proving it satisfies the theorem above. Let us dive right in.

* First we choose two prime numbers `$p$` and `$q$`. Then we calculate `n` as their product: `$n = p \cdot q$`.
* Second, we calculate [Euler's totient function](https://en.wikipedia.org/wiki/Euler%27s_totient_function) `$\phi(n)$`. Unfortunately, calculating `$\phi$` in general terms is an NP problem. Fortunately, and this is no accident, if and only if `p` and `q` are prime numbers, then, it turns out that `$$\phi(n) = (p - 1) \cdot (q - 1)$$` .
* Now we can use a random `$pubKey$`, that satisfies the following 2 conditions:
    * it is [coprime](https://en.wikipedia.org/wiki/Coprime_integers) with `$\phi(n)$`
    * it is smaller than `$\phi(n)$`.
* From there, calculating the `$priKey$` means calculating a `$priKey$` that satisfies the following equation:

`$$a \cdot \phi(n) + priKey \cdot pubKey = 1$$`

where we can use the [extended euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm) to get `$priKey$`. You will notice that in this algorithm the part on the right: `$= 1$` is actually `$= gcd(phi(n), pubKey)$`. [gcd](https://en.wikipedia.org/wiki/Greatest_common_divisor) is the greatest common divisor.

Now we can delete `$p$`, `$q$` and `$\phi(n)$`. And delete them we must, as they could otherwise be used to crack the private key.

#### Example

Let us have a look at an example. 

* We pick `$p = 2399$` and `$q = 26371$`, which are prime numbers large enough for our demonstration. From them, we deduce that `$n = 63264029$` and `$\phi(n) = 63235260$`.
* Now, we have to pick a `$pubKey < \phi(n)$` and not a divisor of it. Let us pick `$pubKey = 54833$`.
* With the help of the [Python implementation](https://en.wikibooks.org/wiki/Algorithm_Implementation/Mathematics/Extended_Euclidean_algorithm) of the extended euclidean algorithm, we pass `xgcd(63235260, 54833)`. It returns us a triplet. We only care about the last element of it, i.e. `$priKey = 6589577$`.

```python
$ python
Python 2.7.15 (default, Dec 13 2018, 23:06:29) 
[GCC 4.2.1 Compatible Apple LLVM 10.0.0 (clang-1000.11.45.5)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> def xgcd(a, b):
...     """return (g, x, y) such that a*x + b*y = g = gcd(a, b)"""
...     x0, x1, y0, y1 = 0, 1, 1, 0
...     while a != 0:
...         q, b, a = b // a, a, b % a
...         y0, y1 = y1, y0 - q * y1
...         x0, x1 = x1, x0 - q * x1
...     return b, x0, y0
... 
>>> xgcd(63235260, 54833)
(1, -5714, 6589577)
```

Now we forget about `$p$`, `$q$` and `$\phi(n)$`. Time to put this effort to good use. Let us encrypt the `$message = 9874587$`. Yes, any digital message is essentially a large number. Notice that we took a message that is smaller than `$n$`. That is by design, otherwise we would lose information. We calculate:

`$$9874587 ^ {54833} \equiv 36898107 \mod 63264029$$`

Our encrypted message is thus `$36898107$`. 

You also happen to know the `$priKey$`, so let us decrypt this right away. We calculate the message back:
`$$36898107 ^ {6589577} \equiv 9874587 \mod 63264029$$`

Yes, our message is, and was, `$9874587$`.

#### Why it works

Let us first introduce Fermat's little theorem. It states that if `$p$` is a prime number then for any number `$a$`, we have `$$a ^ p \equiv a \mod p$$`. If `$a$` is not a multiple of `$p$`, then it can be rewritten as `$$a ^ {p - 1} \equiv 1 \mod p$$`. Our proof will use that knowledge later on.

Let us rework what we have:

`$a \cdot \phi(n) + priKey \cdot pubKey = 1$` means that:

`$$priKey \cdot pubKey \equiv 1 \mod \phi(n)$$`

So `$priKey \cdot pubKey - 1$` is a multiple of `$\phi(n)$`.

But you will recall that `$\phi(n)$` is itself a product of `$p - 1$` and `$q - 1$`. It follows that `$priKey \cdot pubKey - 1$` is a multiple of `$p - 1$` and is also a mutiple of `$q - 1$`. For our purposes, and to express these multiples, we will introduce `$h$` and `$k$` such that:

`$$priKey \cdot pubKey - 1 = h \cdot (p - 1) = k \cdot (q - 1)$$`

With this, let us hop on what we want to prove, encryption followed by decryption works. Let us do just that:

`$$(message ^ {pubKey}) ^ {priKey}$$`

Which, we remember from our algebra classes can be rewritten as:

`$$message ^ {pubKey \cdot priKey}$$`

Which, again, can be rewritten as:

`$$message \cdot message ^ {pubKey \cdot priKey - 1}$$`

Oh we now recognise this thing we had a few lines above. Let us replace and rewrite as:

`$$message \cdot message ^ {h \cdot (p - 1)}$$`

And algebra class helping out, can be rewritten as:

`$$message \cdot (message ^ {p - 1}) ^ {h}$$`

It looks awfully like something we saw in Fermat's little theorem. Let us first suppose that `$message$` is a multiple of `$p$`, i.e. that `$message \equiv 0 \mod p$`. In that case we can say that `$$message ^ {p \cdot q} \equiv message \mod p$$`. 

In other cases, thanks to Fermat's, we have `$message \cdot (message ^ {p -1 }) ^ {h} \equiv message \cdot 1 ^ {h} \equiv message \mod p$`

Now, we can do the same steps but this time with `$k$` and `$q$` in mind: `$message \cdot (message ^ {q -1 }) ^ {k} \equiv message \cdot 1 ^ {k} \equiv message \mod q$`

Let us remember that `$p$` and `$q$` are prime. So for a number to be a multiple of both, it has to be a multiple of their product `$p \cdot q = n$`.

So by mixing these 2 paths, we end up with, `$$(message ^ {pubKey}) ^ {priKey} \equiv message \mod {p \cdot q} \equiv message \mod n$$`. This is what we set out to demonstrate about why RSA works.

#### Trivial zero-knowledge Proof

In order to visually save some space, let us call `$ x $` our message, `$ e $` our public key and `$ E $` our RSA encrytion function. We thus have `$ E(x) = x^e $`. Here we do not care about the private key, which would allow us to decrypt, nor do we care about `$ \mod n $`. We only care about the fact that the keys were created so that they are practically impossible to crack.

We are now going to construct a game scenario whereby Alice wants to prove to Bob that she knows a piece of information without telling Bob what that piece of information is. That is the zero-knowledge part of the proof.

The scenario is the following. Alice and Bob are given a very large number, `$ z $`, for which it is difficult to find divisors. Think `$ z = x \cdot y $` where `$ x $` and `$ y $` are prime numbers. The winner of the game is the one who can find these `$ x $` and `$ y $` divisors. However, the winner does not want the loser to know these divisors, to prevent the loser from pretending that _they_ found the divisors. The winner still wants to convince the loser that they found those divisors.

Let us assume Alice found `$ x $` and `$ y $` such that `$ z = x \cdot y $`. All Alice has to do is give Bob the following 3 pieces of information:

* `$ E(x) $`
* `$ E(y) $`
* `$ z $`, yes, Bob already has it

With these, all Bob has to do to verify Alice's claim is compare `$ E(x) \cdot E(y) $` and `$ E(z) $`. If they are equal, Bob is satisfied with the verification. Why? Because using the classical properties of the [exponentiation](https://en.wikipedia.org/wiki/Exponentiation):

`$$ E(x) \cdot E(y) = x^e \cdot y^e = {x \cdot y}^e = E(x \cdot y) = E(z) $$`

Alice can thus convincingly claim that she has won the game. Additionally, Alice is pretty much reassured that Bob cannot find `$ x $` nor `$ y $`, because he would have to calculate Alice's private key so as to do `$ E(x)^{priKey} \mod n $`. And we know that calculating the private key is practically impossible.

Let us reuse our previous example. If we use `$ x = 12 $` and `$ y = 24 $`, then we get `$12 \cdot 24 = 288$` for the output and we get `$$E(12) \cdot E(24) \equiv E(288) \equiv 60822364 \mod 63264029 $$` with same `$(pubKey, n)$` and `$priKey$` like in the above section. So if we give someone `$E(12)$`, `$E(24)$` and our output `$288$`, he can verify, if the calculation is done well, without knowing `$x$` and `$y$`.

Another trivial example of zero-knowledge proof are digital signatures with RSA. When signing, you use your private key, while the counterparty uses your public key to verify. So in essence, you prove that you have access to the private key without disclosing it. 

