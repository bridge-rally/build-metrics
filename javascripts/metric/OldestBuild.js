Ext.define('metric.OldestBuild', {
    extend: 'metric.AbstractMetric',

    description: 'The oldest build in these metrics is:',

    doSample: function(build) {
        if(this.oldestBuild) { return; }
        this.oldestBuild = build;
    },

    calculate: function() {
        return [
            util.Build.buildDefinitionNameFor(this.oldestBuild),
            this.oldestBuild.get('Number'),
            "(Started",
            new Date(this.oldestBuild.get('Start')).toString() + ")"
        ].join(" ");
    }

});
