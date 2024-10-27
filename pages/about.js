import Layout from '@/app/components/Layout'
import React from 'react'
import LoonsBadge from '../src/app/assets/img/TWSC.webp'
import Image from 'next/image'

const About = () => {
  return (
    <Layout>
      <div className="flex-col justify-center items-center max-w-4xl mx-auto gap-2 p-6">
        <div className="flex justify-center pb-4">
          <Image src={LoonsBadge} width={130} />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-loonsBrown">
          About Loons Team Balancer
        </h1>
        <p className="text-lg leading-relaxed mb-4">
          Loons Team Balancer is a Next.js-based solution designed to create
          fair and well-balanced soccer teams each week. The app takes into
          account player skills, gender, and other attributes to ensure a fun
          and competitive experience for everyone. It is ideal for recurring
          games with a mix of players of different abilities and positions,
          making it easy to shuffle teams fairly every time.
        </p>
        <p className="text-lg leading-relaxed mb-4">
          At the core of the app is a team balancing algorithm. It evaluates the
          players available each week based on their game knowledge, goal
          scoring, attack, midfield, defense, and mobility/stamina abilities.
          Players are sorted primarily by gender and then by overall score.
          Using a modified serpentine draft method, the algorithm distributes
          players across teams while keeping the overall skill levels balanced.
          It even introduces slight randomness to ensure that teams vary week to
          week.
        </p>
        <p className="text-lg leading-relaxed">
          Simply select who's playing and choose how many teams you'd like to
          create. If you're not quite happy with the results, you can click
          `create teams` again to re-generate the teams and or manually drag and
          drop players. When you're happy with the teams, you can print the
          teams in the default, printer friendly format.
        </p>
      </div>
    </Layout>
  )
}

export default About
