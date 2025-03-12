This is just my notes and plans for now.  Figuring out what to do and how to implement it beforehand.
# REST Endpoints

I plan to only use REST stuff for external stuff.  I want editing etc to be handled via websocket, so we can get nice live updating stuff like google docs.

## /photo
* GET - to retrieve the information about the photo, including the URL for the raw data
* POST - To update information about a photo
* PUT - to create a new photo.

## /album
* GET
* POST
* PUT -- multipart/form data? Eh, maybe we can handle it.
 
## /user
* GET
* POST
* PUT

## /project
A project is a group of photos, albums and users.  When you first sign up, you are given your own project transparently.  If you need to access multiple groups of people with multiple photos to go through, you will see an interface for projects.  It will probably just be a dropdown in the top right corner or something.

# Websocket Verbs
I plan to mainly have websocket follow the REST interface, maybe even using the same logic methods (i.e. the REST endpoint just spawns a websocket-like verb action etc)

So for photo, you'd have verbs "photo-get", "photo-post" and "photo-put" etc.  Might reconsider that, but in the interest of moving quickly and just getting this working, I'll stick to it for now.  

The reason to have a separate structure for websocket verbs is to allow live presence stuff and live-updating etc like google docs.

If a verb is intended to run from a client to the server, it will have a right facing arrow (-->).  Vice versa, (<--).  Between peers (i.e. sync updates that everyone needs to respond to) it will be a double headed arrow (<->)

## presence
A presence is someone who is currently actively browsing the site, and is on a certain page.  There can be multiple presences for a single user (i.e. if a user has more than one browser tab open)

* presence-get (-->) - requests an updated list of presences for the current "room"
* presence-got (<--) - payload is the complete list of presences currently in the "room"
* presence (<->) - payload will be the updated status of one or more presences in a room.  Will be relayed between clients without any need to process it. 

## change
A change to a photo's metadata (NOT the actual contents, that will be handled by a separate API).  Changes should NEVER be taken as the canonical representation of anything-- it's only used to monitor in-progress editing.

## update
An update is just a message that contains the complete metadata of a photo entity. It SHOULD be taken as canonical.  (might want to highlight unsaved changes in the GUI or something)
