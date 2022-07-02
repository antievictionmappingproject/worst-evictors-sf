import React from "react"
import { StaticQuery, graphql } from "gatsby"
import { InfoPage } from "./about"

const AboutPage = () => (
  <StaticQuery
    query={graphql`
      query {
        contentfulMethodologyPage {
          title
        }
      }
    `}
    render={(data) => {
      const { title, subtitle, description } =
        data.contentfulMethodologyPage
      return (
        <InfoPage
          title={title}
          subtitle={subtitle}
          description={description}
        />
      )
    }}
  />
)

export default AboutPage
