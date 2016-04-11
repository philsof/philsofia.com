class StaticPagesController < ApplicationController
  def contact
  end

  def about
  end

  def game_2048
    render layout: "2048layout"
  end
end
