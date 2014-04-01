Ext.define('metric.TimeSinceRed', {
    extend: 'metric.AbstractMetric',

    description: 'The light has been green for:',
    builds: {},

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    doSample: function(build) {
        var defName = util.Build.buildDefinitionNameFor(build);
        if(util.Build.isPassing(build)) {
            var lastBuild = this.builds[defName];
            if(lastBuild && util.Build.isPassing(lastBuild)) { return; }
        }
        this.builds[defName] = build;
    },

    calculate: function() {
        if(util.Build.allPassing(this.builds)) {
            var endTimes = values(this.builds, endTime),
                lastBuildEnded = Math.max.apply(this, endTimes);
                diff = new Date() - lastBuildEnded;
            return this.formatDiff(diff);
        } else {
            return "Currently Red";
        }
    }

});
