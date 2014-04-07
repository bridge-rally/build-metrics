Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        Deft.Injector.configure({
            metricStore: "data.store.Metric",
            buildStore: {
                className: 'Rally.data.WsapiDataStore',
                parameters: [{
                    model: 'Build',
                    fetch: true,
                    context: {
                        project: null
                    },
                    limit: Infinity
                }]
            }
        });

        this.add({xtype: 'metricsview'});
    }
});
