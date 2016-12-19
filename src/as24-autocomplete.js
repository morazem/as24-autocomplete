import input from './as24-autocomplete-input';
import tagsDataSource from './data-sources/tags-data-source';

export default (function init() {
    const inputCtr = input();
    const tagsDataSourceCtr = tagsDataSource();
    return { inputCtr, tagsDataSourceCtr };
}());
