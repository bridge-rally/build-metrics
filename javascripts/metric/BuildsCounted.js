Ext.define('metric.BuildsCounted', {
    extend: 'metric.AbstractMetric',

    description: 'These metrics include:',

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    doSample: function(build) {
        var buildDefinitionName = util.Build.buildDefinitionNameFor(build);
        this.getBuilds()[buildDefinitionName] = (this.getBuilds()[buildDefinitionName] || 0) + 1;
    },

    calculate: function() {
        return _.reduce(this.getBuilds(), function(message, buildCount, buildName) {
            message.push(buildCount + ' runs of ' + buildName);
            return message;
        }, []).join('<br />');
    }

});
