/** @odoo-module */

import * as spreadsheet from "@odoo/o-spreadsheet";
import { _t } from "@web/core/l10n/translation";
import { OdooChart } from "./odoo_chart";

const { chartRegistry } = spreadsheet.registries;

const { getDefaultChartJsRuntime, chartFontColor, ChartColors } = spreadsheet.helpers;

chartRegistry.add("odoo_pie", {
    match: (type) => type === "odoo_pie",
    createChart: (definition, sheetId, getters) => new OdooChart(definition, sheetId, getters),
    getChartRuntime: createOdooChartRuntime,
    validateChartDefinition: (validator, definition) =>
        OdooChart.validateChartDefinition(validator, definition),
    transformDefinition: (definition) => OdooChart.transformDefinition(definition),
    getChartDefinitionFromContextCreation: () => OdooChart.getDefinitionFromContextCreation(),
    name: _t("Pie"),
});

function calculatePercentage(dataset, dataIndex) {
    const numericData = dataset.filter((value) => typeof value === "number");
    const total = numericData.reduce((sum, value) => sum + value, 0);
    if (!total) {
        return "";
    }
    const percentage = (dataset[dataIndex] / total) * 100;
    return percentage.toFixed(2);
}

function createOdooChartRuntime(chart, getters) {
    const background = chart.background || "#FFFFFF";
    const { datasets, labels } = chart.dataSource.getData();
    const locale = getters.getLocale();
    const chartJsConfig = getPieConfiguration(chart, labels, locale);
    const colors = new ChartColors();
    for (const { label, data } of datasets) {
        const backgroundColor = getPieColors(colors, datasets);
        const dataset = {
            label,
            data,
            borderColor: "#FFFFFF",
            backgroundColor,
        };
        chartJsConfig.data.datasets.push(dataset);
    }
    return { background, chartJsConfig };
}

function getPieConfiguration(chart, labels, locale) {
    const fontColor = chartFontColor(chart.background);
    const config = getDefaultChartJsRuntime(chart, labels, fontColor, { locale });
    config.type = chart.type.replace("odoo_", "");
    const legend = {
        ...config.options.legend,
        display: chart.legendPosition !== "none",
        labels: { fontColor },
    };
    legend.position = chart.legendPosition;
    config.options.plugins = config.options.plugins || {};
    config.options.plugins.legend = legend;
    config.options.layout = {
        padding: { left: 20, right: 20, top: chart.title ? 10 : 25, bottom: 10 },
    };
    config.options.plugins.tooltip = {
        callbacks: {
            title: function (tooltipItem) {
                return tooltipItem.label;
            },
            label:  function (tooltipItem) {
                debugger;
                //MMconst { format, locale } = localeFormat;
                const data = tooltipItem.dataset.data;
                const dataIndex = tooltipItem.dataIndex;
                const percentage = calculatePercentage(data, dataIndex);
                const xLabel = tooltipItem.label || tooltipItem.dataset.label;
                const yLabel = tooltipItem.parsed.y ?? tooltipItem.parsed;
                //MMconst toolTipFormat = !format && Math.abs(yLabel) >= 1000 ? "#,##" : format;
                //MMconst yLabelStr = formatValue(yLabel, { format: toolTipFormat, locale });
                const yLabelStr = yLabel;
                //return xLabel ? `${xLabel}: ${yLabelStr} (${percentage}%)` : `${yLabelStr} (${percentage}%)`;
                return `${yLabelStr} (${percentage}%)`;
            }
        }
    };
    return config;
}

function getPieColors(colors, dataSetsValues) {
    const pieColors = [];
    const maxLength = Math.max(...dataSetsValues.map((ds) => ds.data.length));
    for (let i = 0; i <= maxLength; i++) {
        pieColors.push(colors.next());
    }

    return pieColors;
}
