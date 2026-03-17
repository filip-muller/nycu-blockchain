# Writeup

## Why are signatures useful in Ethereum applications?

Signatures allow the owner to approve a transaction off-chain. The cryptography allows them to do
this locally using solely their private key without the need for any coordination on-chain.

## What is a replay attack?

A replay attack is an attack that tries to bypass the need of a signature to perform an acivity. It
does this by capturing a message with a signature and reusing it. In the case of this lab getting
the message with a signature is simple as it is generally provided by the owner and the attack lays
in reusing the same signature multiple times to get more funds then the owner approved.

## How does your contract prevent replay attacks?
My contract prevents the replay throught the use of a nonce. It does this rather strictly (I
understand this is what the assignemnt asked for), by only allowing a single signature to be valid
for a certain owner at one time. The signature is identified by the current owner nonce which is
tracked in the contract. When the signature gets used, the nonce gets incremented, which prevents
the signature from being used again as the contract rejects signatures with an old nonce.
