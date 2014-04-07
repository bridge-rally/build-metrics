Ext.define('controller.Metrics', {
    extend: 'Deft.mvc.ViewController',
    inject: ['metricStore', 'buildStore'],

    config: {
        metricStore: null,
        buildStore: null
    },

    observe: {
        buildStore: {
            load: 'onBuildStoreLoad'
        }
    },

    buildDefinitions: [
        '/builddefinition/14104398785' // alm
//        '/builddefinition/13714100093' // appsdk
//          '/builddefinition/16592393460' // app-catalog

    ],

    metrics: [
        'metric.GreenTimePerDayForOneBuild'
    ],

    init: function() {
        this.callParent(arguments);
        this.getView().setLoading(true);
        var buildStore = this.getBuildStore();
        buildStore.filter([
            this.filterByTime(),
            this.filterByBuildDefinition()
        ]);
    },

    filterByTime: function() {
        //var startTime = Ext.Date.format(Ext.Date.add(new Date(), Ext.Date.DAY, -1), 'Y-m-d');
        var daysBefore = 180;
        var startTime = "today - " + daysBefore;

        return Ext.create('Rally.data.QueryFilter', {
            property: 'Start',
            operator: '>=',
            value: startTime
        });
    },

    filterByBuildDefinition: function() {
        return _.reduce(this.buildDefinitions, function(filter, buildDefinition) {
            var filterCondition = Ext.create('Rally.data.QueryFilter', {
                property: 'BuildDefinition',
                value: buildDefinition
            });
            return filter ? filter.or(filterCondition) : filterCondition;
        }, null);
    },

    onBuildStoreLoad: function(store, records, successful) {
        _.forEach(records, function(record) {

        });
        _.forEach(this.metrics, function(metric) {
            metric = Ext.create(metric, {buildDefinitions: this.buildDefinitions});
            metric.sample(records);

            this.getMetricStore().add(Ext.create('data.model.Metric', {
                description: metric.getDescription(),
                data: metric.calculate()
            }));
        }, this);

        this.getView().setLoading(false);
    }

});
