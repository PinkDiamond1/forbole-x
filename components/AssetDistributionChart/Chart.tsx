import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Avatar, Box, Typography, useTheme } from '@material-ui/core'
import useTranslation from 'next-translate/useTranslation'
import useStyles from './styles'
import { CustomTheme } from '../../misc/theme'
import { formatPercentage } from '../../misc/utils'

interface ChartProp {
  data: {
    name: string
    image: string
    value: number
  }[]
  setPopoverIndex(i: number): void
  setAnchorPosition(position: { top: number; left: number }): void
}
const Chart: React.FC<ChartProp> = ({ data: rawData, setPopoverIndex, setAnchorPosition }) => {
  const classes = useStyles()
  const { lang } = useTranslation('common')
  const data = React.useMemo(() => {
    const result = []
    rawData.forEach((d, i) => {
      const startAngle = i === 0 ? 0 : result[i - 1].endAngle
      const endAngle = startAngle + 360 * d.value
      const outerRadius = `${100 * (1 - 0.6 * (i / rawData.length))}%`
      result.push({
        ...d,
        startAngle,
        endAngle,
        outerRadius,
      })
    })
    return result
  }, [rawData])
  const [activeIndex, setActiveIndex] = React.useState(0)
  const theme: CustomTheme = useTheme()
  const COLORS = [
    theme.palette.pieChart.color1,
    theme.palette.pieChart.color2,
    theme.palette.pieChart.color3,
    theme.palette.pieChart.color4,
    theme.palette.pieChart.color5,
    theme.palette.pieChart.color6,
  ]

  // todo: how to override light mode color of the pie? it shows black when it is activeIndex

  const { top, left } = React.useMemo(() => {
    const midAngle =
      (((data[activeIndex].startAngle + data[activeIndex].endAngle) / 2) * Math.PI) / 180
    const radius = (1.27 * Number(data[activeIndex].outerRadius.replace('%', ''))) / 2
    return {
      top: `calc(50% - ${Math.sin(midAngle) * radius}px)`,
      left: `calc(30% + ${Math.cos(midAngle) * radius}px)`,
    }
  }, [activeIndex, data])

  return (
    <Box position="relative" height={theme.spacing(33.5)} maxWidth={theme.spacing(64)} mx="auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {data.map((d, i) => (
            <Pie
              key={d.name}
              cx="30%"
              outerRadius={d.outerRadius}
              data={[d]}
              startAngle={d.startAngle}
              endAngle={d.endAngle}
              dataKey="value"
              animationBegin={200 * i}
              animationDuration={200}
              animationEasing="linear"
            >
              <Cell
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={(e) => {
                  setPopoverIndex(i)
                  setAnchorPosition({ top: e.clientY, left: e.clientX })
                }}
                fill={COLORS[i % COLORS.length].main}
                stroke={theme.palette.background.default}
                opacity={activeIndex === i ? 0.8 : 1}
              />
            </Pie>
          ))}
        </PieChart>
      </ResponsiveContainer>
      <Box className={classes.divider} style={{ top, left }}>
        <Typography className={classes.percentText} variant="h2" gutterBottom>
          {formatPercentage(data[activeIndex].value, lang)}
        </Typography>
        <Box display="flex" alignItems="center">
          <Avatar className={classes.avatar} src={data[activeIndex].image} />
          <Typography>{data[activeIndex].name}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Chart