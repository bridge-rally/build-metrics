Ext.define('data.store.Metric', {
    extend: 'Ext.data.Store',
    model: 'data.model.Metric',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
