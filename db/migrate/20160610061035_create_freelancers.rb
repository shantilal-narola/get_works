class CreateFreelancers < ActiveRecord::Migration
  def change
    create_table :freelancers do |t|

      t.timestamps null: false
    end
  end
end
