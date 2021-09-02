# Events

## Long-running exercise

We want to surface some information that is usable for server systems and GUIs:

* Per transaction:
    * The game was created. Both players need to be notified.
    * The player has played. The other player needs to be notified.
    * The game was rejected. The other player needs to be notified.
    * Perhaps the game was won. Both players need to be notified.
* Per block:
    * These games timed out. The game ids and the involved players need to be notified.

TODO implement them.
