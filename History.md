
v0.11.4 / 2016-12-23
==================

  * Automate release process

v0.11.3 / 2016-12-23
====================

  * Prevent from selecting 'non-exists' element

v0.11.2 / 2016-12-21
====================

  * Escape special chars

v0.11.1 / 2016-12-21
====================

  * small bug fixes

v0.11.0 / 2016-12-21
====================

  * Changed the way data source is being found in the dom. It should be placed inside autocomplete itself

v0.10.3 / 2016-12-21
====================

  * Fixed initial dirty state

v0.10.2 / 2016-12-21
====================

  * Fixed arrow click when input is disabled

v0.10.1 / 2016-12-21
====================

  * Fixed handle of cross button click

v0.10.0 / 2016-12-21
====================

  * Added reset() and toggleDisabled() methods to the public APi

v0.9.0 / 2016-12-21
===================

  * Mark element dirty or not so that you can simply query whether the value has been selected or not

v0.8.0 / 2016-12-20
===================

  * Added the methods for retrieving value/userQuery/dataSourceElement.

v0.7.2 / 2016-12-20
===================

  * Improved the way the suggestion list is being formed. Refactored rendering of items

v0.7.1 / 2016-12-19
===================

  * Fixed the initialisation of the autocomplete

v0.7.0 / 2016-12-19
===================

  * Changed the way the predefined (initial) value is being fetched

v0.6.0 / 2016-12-19
===================

  * Updted deps list
  * Better gulp setup

v0.5.0 / 2016-12-19
===================

  * Added support for initial user input

v0.4.3 / 2016-12-19
===================

  * Fixed code style

0.4.2 / 2016-12-16
==================

  * Fixed autocomplete triggering onchange event on hidden input
  * Refactored the data source to be more developer friendly. Removed an ugly hack with global cache

v0.4.1 / 2016-12-14
===================

  * Fixed opening of suggestion list when down key was pushed
  * Added clean-up button
  * Added support for the tab key
  * Added documentation to the code

v0.3.1 / 2016-12-12
===================

  * Introduced "selected" color and "preselected". The first one is used for keyboard nav and another for mouse. Fixed the arrow click toggles the suggestions list
  * Introduced the arrow icons to signify the state of the drop-down  - added optional icon. You can use your own, however. Note: when the element gets activated, the icon will be rotated.  - the root element can have a class that denotes the state of the drop-down
  * temp solution for routing events
  * changed demo page
  * fixed indentation and updated gitallowed
  * added gitallowed file
  * mouse disabled state refactoring
  * first solution with mouse event prevented
  * changed color in hover
  * added mouse and keyboard following highlighting
  * changed border colors for focused list
  * removed box-shadow
  * list of options now seamless with the input
  * select first element by default and fixed bug with scrolling by keyboard
  * Merged branch v0.2.3 into master
  * bumped version
  * merged
  * added placeholder and changed box-sizing for list
  * Fix for key events

v0.2.3 / 2016-11-11
===================

  * added highlightning to result list
  * added placeholder and changed box-sizing for list

v0.2.2 / 2016-11-04
===================

  * Fix for key events

v0.2.1 / 2016-11-03
===================

  * Bugfix
  * Update README.md

v0.2.0 / 2016-11-02
===================

  * Empy list handling

v0.1.1 / 2016-10-21
===================

  * Added new build target, fixed modules
  * Added another build artifact
  * Update README.md


v0.1.0 / 2016-10-21
===================

  * Added another build artifact

v0.0.8 / 2016-10-21
===================

  * Fixed readme
  * Fixed keyboard navigation
  * Further refactoring
  * Fixed filtering and hover
  * Keyboards nav works
  * Huge improvements
  * Added browser sync
  * Diana/Ivan: first results
  * Initial commit
