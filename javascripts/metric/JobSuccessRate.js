Ext.define('metric.JobSuccessRate', {
    extend: 'metric.AbstractMetric',

    description: 'Build success rate:',
    builds: {},

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    doSample: function(build) {
        var buildDefinitionName = util.Build.buildDefinitionNameFor(build);

        if (!this.builds[buildDefinitionName]) {
            this.builds[buildDefinitionName] = {
                count: 0,
                success: 0
            };
        }
        this.builds[buildDefinitionName].count++;

        if (util.Build.isPassing(build)) {
            this.builds[buildDefinitionName].success += 1;
        }
    },

    calculate: function() {
        var message,
            stats;

        return _.reduce(this.builds, function(result, value, key) {
            stats = this.builds[key];
            message = (Math.round(10000 * stats.success / stats.count)/100) + '% success for ' + key;
            result.push(message);
            return result;
        }, [], this).join("<br />");
    }

});
