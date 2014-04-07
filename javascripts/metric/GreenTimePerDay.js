Ext.define('metric.GreenTimePerDay', {
    extend: 'metric.AbstractMetric',

    description: 'On average from 6AM to 6PM Mountain time, the light is green for:',

    days: [],
    diffs: [],

    constructor: function(config) {
        this.mergeConfig(config);
        this.callParent(arguments);
    },

    doSample: function(build) {
        var buildName = util.Build.buildDefinitionNameFor(build);
        if(this.hasAllBuilds(this.getBuilds())) {
            this.addDay(build);
            var previouslyPassing = util.Build.allPassing(this.getBuilds());
            this.getBuilds()[buildName] = build;
            if(this.hasPassed) {
                if(previouslyPassing && util.Build.isFailing(build)) {
                    this.redStart = util.Build.endTime(build);
                } else if(!previouslyPassing && util.Build.allPassing(this.getBuilds())) {
                    var buildEnded = util.Build.endTime(build);
                    if(this.withinWorkingHours(this.redStart) || this.withinWorkingHours(buildEnded)) {
                        this.diffs.push(this.adjustEndTime(buildEnded) - this.adjustStartTime(this.redStart));
                    }
                }
            }
            if(previouslyPassing) { this.hasPassed = true; }
        } else {
            this.getBuilds()[buildName] = build;
        }
    },

    calculate: function() {
        var numberOfDays = this.days.length,
            totalMillis = numberOfDays * 12 * 60 * 60 * 1000;
        for(var i = 0; i < numberOfDays; i++) {
            totalMillis -= isNaN(this.diffs[i]) ? 0 : this.diffs[i];
        }
        return this.formatDiff(totalMillis / numberOfDays) + " per day (" + numberOfDays + " days of data)";
    },

    withinWorkingHours: function(time) {
        var date = new Date(time),
        hour = date.getHours(),
        day = date.getDay();
        // 6:00 AM to 5:59:59 PM
        return hour > 5 && hour < 18;
    },

    adjustTime: function(time, min, sec, mil) {
        var d = new Date(time);
        d.setMinutes(min);
        d.setSeconds(sec);
        d.setMilliseconds(mil);
        return d;
    },

    adjustStartTime: function(time) {
        if(this.withinWorkingHours(time)) {
            return time;
        }

        var start = this.adjustTime(time, 0, 0, 0),
            hour = start.getHours();
        if(hour > 17) {
            start = start + ((30 - hour) * 60 * 60 * 1000);
        } else {
            start = start + ((6 - hour) * 60 * 60 * 1000);
        }
        return start;
    },

    adjustEndTime: function(time) {
        if(this.withinWorkingHours(time)) {
            return time;
        }

        var end = this.adjustTime(time, 59, 59, 999),
            hour = end.getHours();
        if(hour > 17) {
            end = end - ((hour - 17) * 60 * 60 * 1000);
        } else {
            end = end - ((34 - hour) * 60 * 60 * 1000);
        }
        return end;
    },

    addDay: function(build) {
        var day = new Date(util.Build.endTime(build)).toDateString();
        if(this.days.indexOf(day) == -1) {
            this.days.push(day);
        }
    }

});
