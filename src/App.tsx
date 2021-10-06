import React from 'react';
import { Component } from 'react';
import { Element } from 'react-faux-dom';
import * as d3 from 'd3';

import './App.css';
import { Fragment } from 'react';

interface AppState {
    count: number;
    planets: any[];
    next: string;
    previous: string;
}

class App extends Component<{}, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            count: 0,
            planets: [],
            next: '',
            previous: ''
        };
    }

    componentDidMount(): void {
        const url = 'https://swapi.dev/api/planets/';
        this.fetchData(url);
    }

    plot(chart: any, width: number, height: number) {
        const xScale = d3.scaleBand()
            .domain(this.state.planets.map((planet: { name: string; }) => planet.name))
            .rangeRound([0, width]);
        const yScale = d3.scaleLinear()
            .domain([
                0,
                d3.max(this.state.planets, (planet: { population: number }) => planet.population) as number * 2
            ])
            .range([
                height,
                d3.min(this.state.planets, (planet: { population: number }) => planet.population) as number
            ]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        chart.selectAll('.bar')
            .data(this.state.planets)
            .enter()
            .append('rect')
            .classed('bar', true)
            .attr('width', () => xScale.bandwidth())
            .attr('height', (planet: { population: number; }) => (height - yScale(planet.population)))
            .attr('x', (planet: { name: string; }) => xScale(planet.name))
            .attr('y', (planet: { population: number; }) => yScale(planet.population))
            .style('fill', (_: any, i: string) => colorScale(i));

        const xAxis = d3.axisBottom(xScale);

        chart.append('g')
            .classed('x axis', true)
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        const yAxis = d3.axisLeft(yScale)
            .ticks(10);

        chart.append('g')
            .classed('y axis', true)
            .attr('transform', `translate(0, 0)`)
            .call(yAxis);

        chart.select('.x.axis')
            .append('text')
            .attr('x', width / 2)
            .attr('y', 60)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Planet(s)');

        chart.select('.y.axis')
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('transform', `translate(-50, ${height / 2}) rotate(-90)`)
            .attr('fill', '#000')
            .style('font-size', '20px')
            .style('text-anchor', 'middle')
            .text('Population per billion');
    }

    drawChart() {
        const width = 800;
        const height = 450;

        const el = new Element('div');
        const svg = d3.select(el)
            .append('svg')
            .attr('id', 'chart')
            .attr('width', width)
            .attr('height', height);

        const margin = {
            top: 60,
            bottom: 100,
            left: 80,
            right: 40
        };

        const chart = svg.append('g')
            .classed('display', true)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        this.plot(chart, chartWidth, chartHeight);

        return el.toReact();
    }

    private redraw(url: string): void {
        if (!url) {
            return;
        }
        this.fetchData(url);
    }

    private fetchData(url: string): void {
        d3.json(url)
            .then((data: any) => {
                const planets = data.results.map((planet: any) => ({
                    name: planet.name,
                    population: (Number.isNaN(+planet.population) ? 0 : +planet.population) / 1000000000
                }))
                    .sort((a: { name: string; }, b: { name: string; }) => {
                        if (a.name.toLowerCase() > b.name.toLowerCase()) {
                            return 1;
                        } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
                            return -1;
                        }
                        return 0;
                    });
                this.setState({ planets, ...data });
            });
    }

    render() {
        return (
            <Fragment>
                {this.drawChart()}
                <div id="container">
                    <button id="last" onClick={() => this.redraw(this.state.previous)}>Back</button>
                    <button id="next" onClick={() => this.redraw(this.state.next)}>Next</button>
                </div>
            </Fragment>
        );
    }
}

export default App;
