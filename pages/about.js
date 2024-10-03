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
          players available each week based on their attack, defense, and
          fitness scores. Players are sorted primarily by gender and then by
          overall score. Using a modified serpentine draft method, the algorithm
          distributes players across teams while keeping the overall skill
          levels balanced. It even introduces slight randomness to ensure that
          teams vary week to week.
        </p>
        <p className="text-lg leading-relaxed mb-4">
          The app also tracks the ratio of players by gender to ensure
          inclusivity. Whether the group has an even or odd number of players,
          or an unbalanced mix of skillsets, the Loons Team Balancer aims for
          fairness in team distribution, fostering an enjoyable game for all
          participants.
        </p>
        <p className="text-lg leading-relaxed">
          Simply choose who's playing, select how many teams you'd like to
          create, re-generate the teams again if you're not quite happy with the
          results, and then print the created teams in the default, printer
          friendly format.
        </p>
      </div>
    </Layout>
  )
}

export default About
