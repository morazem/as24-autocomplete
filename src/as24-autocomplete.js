import input from './as24-autocomplete-input';
import plainDataSource from './data-sources/plain-data-source';
import groupedItemsDataSource from './data-sources/grouped-items-data-source';
import plainSuggestionsList from './suggestions-lists/plain-suggestions-list';
import groupedSuggestionsList from './suggestions-lists/grouped-suggestions-list';
import dispatcher from './as24-autocomplete-dispatcher';

input();
plainDataSource();
groupedItemsDataSource();
plainSuggestionsList();
groupedSuggestionsList();
dispatcher();
